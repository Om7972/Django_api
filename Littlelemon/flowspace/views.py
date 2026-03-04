"""
FlowSpace API Views - ViewSet-based architecture with caching and custom actions.
"""

import logging
from rest_framework import viewsets, status, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q

from .models import (
    Subscription, Team, TeamMembership, TeamWorkspace,
    UserProfile, FocusSession, DistractionEvent,
    EnvironmentLog, ProductivityMetric,
    Achievement, UserAchievement, UserStreak,
)
from .serializers import (
    SubscriptionSerializer,
    TeamSerializer, TeamCreateSerializer, TeamMembershipSerializer,
    AddTeamMemberSerializer, TeamWorkspaceSerializer,
    UserProfileSerializer,
    FocusSessionSerializer, FocusSessionStartSerializer,
    DistractionEventSerializer,
    EnvironmentLogSerializer, ProductivityMetricSerializer,
    AchievementSerializer, UserAchievementSerializer,
    UserStreakSerializer,
)
from .filters import FocusSessionFilter, EnvironmentLogFilter, ProductivityMetricFilter
from .pagination import SmallPagination, TimeSeriesPagination
from .cache import (
    get_dashboard_cache, set_dashboard_cache, invalidate_dashboard_cache,
    get_focus_score_cache, set_focus_score_cache, invalidate_focus_score_cache,
)

logger = logging.getLogger('flowspace')


# =============================================================================
# Permissions
# =============================================================================
class IsOwnerOrAdmin(permissions.BasePermission):
    """Only the object owner or an admin can access."""
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user or request.user.is_staff
        return request.user.is_staff


class IsTeamAdminOrOwner(permissions.BasePermission):
    """Only team owner or team admin can manage members."""
    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True
        return TeamMembership.objects.filter(
            user=request.user, team=obj, role='admin'
        ).exists()


# =============================================================================
# Subscription ViewSet
# =============================================================================
class SubscriptionViewSet(viewsets.GenericViewSet,
                          mixins.RetrieveModelMixin):
    """
    View and manage user subscription.
    - me: GET current user's subscription
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get or create the current user's subscription."""
        subscription, created = Subscription.objects.get_or_create(
            user=request.user,
            defaults={'plan': 'free', 'status': 'active'}
        )
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='limits')
    def limits(self, request):
        """Get current plan limits."""
        sub, _ = Subscription.objects.get_or_create(
            user=request.user,
            defaults={'plan': 'free', 'status': 'active'}
        )
        return Response({
            'plan': sub.plan,
            'is_active': sub.is_active,
            'is_premium': sub.is_premium,
            'limits': {
                'max_sessions_per_day': sub.max_sessions_per_day,
                'max_team_members': sub.max_team_members,
                'max_environment_devices': sub.max_environment_devices,
                'analytics_retention_days': sub.analytics_retention_days,
                'ai_recommendations': sub.ai_recommendations_enabled,
                'advanced_analytics': sub.advanced_analytics_enabled,
                'custom_soundscapes': sub.custom_soundscapes_enabled,
            }
        })


# =============================================================================
# Team ViewSet
# =============================================================================
class TeamViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for teams.
    - list: All teams the user belongs to
    - create: Create a new team (user becomes owner)
    - add_member / remove_member: Manage team members
    """
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SmallPagination
    search_fields = ['name']

    def get_queryset(self):
        return Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().select_related('owner', 'workspace').prefetch_related('memberships__user')

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        team = serializer.save(owner=self.request.user)
        # Auto-add owner as admin member
        TeamMembership.objects.create(user=self.request.user, team=team, role='admin')
        # Auto-create workspace
        TeamWorkspace.objects.create(team=team)
        logger.info('Team created: %s by user %s', team.name, self.request.user.username)

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        """Add a member to the team."""
        team = self.get_object()
        serializer = AddTeamMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(username=serializer.validated_data['username'])
        role = serializer.validated_data.get('role', 'member')

        membership, created = TeamMembership.objects.get_or_create(
            user=user, team=team, defaults={'role': role}
        )
        if not created:
            return Response(
                {'error': 'User is already a team member.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info('User %s added to team %s as %s', user.username, team.name, role)
        return Response(TeamMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='remove-member')
    def remove_member(self, request, pk=None):
        """Remove a member from the team."""
        username = request.data.get('username')
        if not username:
            return Response(
                {'error': 'username is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        team = self.get_object()
        user = get_object_or_404(User, username=username)
        if user == team.owner:
            return Response(
                {'error': 'Cannot remove the team owner.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted, _ = TeamMembership.objects.filter(user=user, team=team).delete()
        if not deleted:
            return Response(
                {'error': 'User is not a member of this team.'},
                status=status.HTTP_404_NOT_FOUND
            )

        logger.info('User %s removed from team %s', user.username, team.name)
        return Response({'message': username + ' removed from team.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'put', 'patch'], url_path='workspace')
    def workspace(self, request, pk=None):
        """Get or update team workspace settings."""
        team = self.get_object()
        ws, _ = TeamWorkspace.objects.get_or_create(team=team)

        if request.method in ('PUT', 'PATCH'):
            serializer = TeamWorkspaceSerializer(
                ws, data=request.data, partial=(request.method == 'PATCH')
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(TeamWorkspaceSerializer(ws).data)

    @action(detail=True, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request, pk=None):
        """Team focus score leaderboard."""
        team = self.get_object()
        today = timezone.now().date()
        member_ids = team.memberships.values_list('user_id', flat=True)

        leaderboard = (
            FocusSession.objects.filter(
                user_id__in=member_ids,
                start_time__date=today,
                is_completed=True
            )
            .values('user__username', 'user__id')
            .annotate(
                avg_score=Avg('focus_score'),
                total_sessions=Count('id'),
            )
            .order_by('-avg_score')
        )

        return Response(list(leaderboard))


# =============================================================================
# UserProfile ViewSet
# =============================================================================
class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user).select_related('user')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """Get or update the current user's profile."""
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        if request.method in ('PUT', 'PATCH'):
            serializer = self.get_serializer(
                profile, data=request.data, partial=(request.method == 'PATCH')
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        serializer = self.get_serializer(profile)
        return Response(serializer.data)


# =============================================================================
# FocusSession ViewSet
# =============================================================================
class FocusSessionViewSet(viewsets.ModelViewSet):
    """
    CRUD for focus sessions with custom start/end actions.
    Supports filtering by date range, task type, completion status.
    """
    serializer_class = FocusSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = FocusSessionFilter
    search_fields = ['task_type', 'label']
    ordering_fields = ['start_time', 'focus_score', 'distractions_count']
    ordering = ['-start_time']

    def get_queryset(self):
        return FocusSession.objects.filter(
            user=self.request.user
        ).select_related('user', 'team').prefetch_related('distraction_events')

    def perform_create(self, serializer):
        session = serializer.save(user=self.request.user)
        invalidate_dashboard_cache(self.request.user.id)
        invalidate_focus_score_cache(self.request.user.id)
        logger.info('Focus session created: %s for user %s', session.id, self.request.user.username)

    @action(detail=False, methods=['post'], url_path='start')
    def start_session(self, request):
        """Start a new focus session with current environment data."""
        serializer = FocusSessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = FocusSession.objects.create(
            user=request.user,
            start_time=timezone.now(),
            **serializer.validated_data,
        )
        invalidate_dashboard_cache(request.user.id)
        logger.info('Focus session started: %s', session.id)
        return Response(FocusSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='end')
    def end_session(self, request, pk=None):
        """End an active focus session and update streak."""
        session = self.get_object()
        if session.end_time:
            return Response(
                {'error': 'Session already ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.end_time = timezone.now()
        session.duration = session.end_time - session.start_time
        session.is_completed = True

        if 'focus_score' in request.data:
            session.focus_score = request.data['focus_score']
        if 'distractions_count' in request.data:
            session.distractions_count = request.data['distractions_count']
        if 'notes' in request.data:
            session.notes = request.data['notes']

        session.save()
        invalidate_dashboard_cache(request.user.id)
        invalidate_focus_score_cache(request.user.id)

        # Update streak
        streak, _ = UserStreak.objects.get_or_create(user=request.user)
        streak.update_streak()

        logger.info('Focus session ended: %s (duration: %s)', session.id, session.duration)
        return Response(FocusSessionSerializer(session).data)

    @action(detail=True, methods=['post'], url_path='add-distraction')
    def add_distraction(self, request, pk=None):
        """Log a distraction event during a focus session."""
        session = self.get_object()
        if session.end_time:
            return Response(
                {'error': 'Cannot add distractions to ended session.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DistractionEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(session=session, user=request.user)

        # Increment session distraction count
        session.distractions_count += 1
        session.save(update_fields=['distractions_count'])

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='stats')
    def session_stats(self, request):
        """Get aggregate statistics for the user's focus sessions."""
        sessions = self.get_queryset()
        today = timezone.now().date()
        today_sessions = sessions.filter(start_time__date=today)

        stats = {
            'total_sessions': sessions.count(),
            'completed_sessions': sessions.filter(is_completed=True).count(),
            'today': {
                'sessions': today_sessions.count(),
                'completed': today_sessions.filter(is_completed=True).count(),
                'avg_focus_score': today_sessions.aggregate(
                    avg=Avg('focus_score')
                )['avg'] or 0,
                'total_distractions': today_sessions.aggregate(
                    total=Sum('distractions_count')
                )['total'] or 0,
            },
            'all_time': {
                'avg_focus_score': sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0,
                'total_distractions': sessions.aggregate(
                    total=Sum('distractions_count')
                )['total'] or 0,
                'sessions_by_type': dict(
                    sessions.values_list('task_type')
                    .annotate(count=Count('id'))
                    .values_list('task_type', 'count')
                ),
            },
        }
        return Response(stats)


# =============================================================================
# DistractionEvent ViewSet
# =============================================================================
class DistractionEventViewSet(viewsets.ModelViewSet):
    """CRUD for distraction events."""
    serializer_class = DistractionEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    ordering = ['-timestamp']

    def get_queryset(self):
        return DistractionEvent.objects.filter(user=self.request.user).select_related('session')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='analysis')
    def distraction_analysis(self, request):
        """Analyze distraction patterns."""
        events = self.get_queryset()
        return Response({
            'total_events': events.count(),
            'by_type': dict(
                events.values_list('distraction_type')
                .annotate(count=Count('id'))
                .values_list('distraction_type', 'count')
            ),
            'avg_severity': events.aggregate(avg=Avg('severity'))['avg'] or 0,
            'avg_recovery_seconds': events.aggregate(
                avg=Avg('recovery_time_seconds')
            )['avg'] or 0,
            'by_severity': dict(
                events.values_list('severity')
                .annotate(count=Count('id'))
                .values_list('severity', 'count')
            ),
        })


# =============================================================================
# EnvironmentLog ViewSet
# =============================================================================
class EnvironmentLogViewSet(viewsets.ModelViewSet):
    """CRUD for environment readings with cursor-based pagination."""
    serializer_class = EnvironmentLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = EnvironmentLogFilter
    pagination_class = TimeSeriesPagination
    ordering = ['-timestamp']

    def get_queryset(self):
        return EnvironmentLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        invalidate_dashboard_cache(self.request.user.id)

    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        """Get the most recent environment reading."""
        log = self.get_queryset().first()
        if not log:
            return Response(
                {'message': 'No environment data available.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(EnvironmentLogSerializer(log).data)


# =============================================================================
# ProductivityMetric ViewSet
# =============================================================================
class ProductivityMetricViewSet(viewsets.ModelViewSet):
    """CRUD for daily productivity metrics."""
    serializer_class = ProductivityMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = ProductivityMetricFilter
    ordering = ['-date']

    def get_queryset(self):
        return ProductivityMetric.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =============================================================================
# Achievement ViewSet
# =============================================================================
class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """List all available achievements (read-only)."""
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SmallPagination
    search_fields = ['name', 'description']
    filterset_fields = ['category', 'rarity', 'is_active']
    ordering = ['category', 'criteria_value']

    def get_queryset(self):
        return Achievement.objects.filter(is_active=True)


class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """List achievements unlocked by the current user."""
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-unlocked_at']

    def get_queryset(self):
        return UserAchievement.objects.filter(
            user=self.request.user
        ).select_related('achievement')


# =============================================================================
# Streak ViewSet
# =============================================================================
class UserStreakViewSet(viewsets.GenericViewSet):
    """View current user streak data."""
    serializer_class = UserStreakSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get current user's streak data."""
        streak, _ = UserStreak.objects.get_or_create(user=request.user)
        return Response(UserStreakSerializer(streak).data)


# =============================================================================
# Dashboard ViewSet (read-only, cached)
# =============================================================================
class DashboardViewSet(viewsets.ViewSet):
    """
    Aggregated dashboard data endpoint with Redis caching.
    GET /dashboard/ - returns focus stats, environment, productivity, streak.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user

        # Check cache first
        cached_data = get_dashboard_cache(user.id)
        if cached_data:
            return Response(cached_data)

        # Build fresh dashboard data
        today = timezone.now().date()
        latest_env = EnvironmentLog.objects.filter(user=user).order_by('-timestamp').first()

        # Today's sessions
        today_sessions = FocusSession.objects.filter(user=user, start_time__date=today)
        total_sessions = today_sessions.count()
        completed_sessions = today_sessions.filter(is_completed=True).count()
        completion_rate = completed_sessions / total_sessions if total_sessions > 0 else 0

        total_focus_time = sum(
            (s.duration.total_seconds() if s.duration else 0 for s in today_sessions), 0
        )

        # Focus score (cached separately)
        focus_score = get_focus_score_cache(user.id)
        if focus_score is None:
            focus_score = today_sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0
            set_focus_score_cache(user.id, focus_score)

        # Streak
        streak, _ = UserStreak.objects.get_or_create(user=user)

        # Subscription
        sub, _ = Subscription.objects.get_or_create(
            user=user, defaults={'plan': 'free', 'status': 'active'}
        )

        # Today's metric
        latest_metric = ProductivityMetric.objects.filter(user=user, date=today).first()

        # Recent achievements
        recent_achievements = UserAchievement.objects.filter(
            user=user
        ).select_related('achievement').order_by('-unlocked_at')[:5]

        data = {
            'environment': EnvironmentLogSerializer(latest_env).data if latest_env else None,
            'focus_stats': {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'completion_rate': round(completion_rate, 2),
                'total_focus_time_seconds': total_focus_time,
                'avg_focus_score': round(focus_score, 1),
            },
            'streak': UserStreakSerializer(streak).data,
            'subscription': {
                'plan': sub.plan,
                'is_premium': sub.is_premium,
            },
            'productivity': ProductivityMetricSerializer(latest_metric).data if latest_metric else None,
            'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data,
            'cached_at': timezone.now().isoformat(),
        }

        set_dashboard_cache(user.id, data)
        return Response(data)