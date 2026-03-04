"""
FlowSpace API Views - ViewSet-based architecture with caching and custom actions.
"""

import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q

from .models import (
    Team, TeamMembership, UserProfile,
    FocusSession, EnvironmentLog, ProductivityMetric,
)
from .serializers import (
    TeamSerializer, TeamCreateSerializer, TeamMembershipSerializer,
    AddTeamMemberSerializer, UserProfileSerializer,
    FocusSessionSerializer, FocusSessionStartSerializer,
    EnvironmentLogSerializer, ProductivityMetricSerializer,
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
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        team = serializer.save(owner=self.request.user)
        # Auto-add owner as admin member
        TeamMembership.objects.create(user=self.request.user, team=team, role='admin')
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


# =============================================================================
# UserProfile ViewSet
# =============================================================================
class UserProfileViewSet(viewsets.ModelViewSet):
    """
    User profile management.
    - me: GET/PUT current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

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
    search_fields = ['task_type']
    ordering_fields = ['start_time', 'focus_score', 'distractions_count']
    ordering = ['-start_time']

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

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
        """End an active focus session."""
        session = self.get_object()
        if session.end_time:
            return Response(
                {'error': 'Session already ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.end_time = timezone.now()
        session.duration = session.end_time - session.start_time
        session.is_completed = True

        # Update focus score if provided
        if 'focus_score' in request.data:
            session.focus_score = request.data['focus_score']
        if 'distractions_count' in request.data:
            session.distractions_count = request.data['distractions_count']

        session.save()
        invalidate_dashboard_cache(request.user.id)
        invalidate_focus_score_cache(request.user.id)

        logger.info('Focus session ended: %s (duration: %s)', session.id, session.duration)
        return Response(FocusSessionSerializer(session).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def session_stats(self, request):
        """Get aggregate statistics for the user's focus sessions."""
        sessions = self.get_queryset()
        today = timezone.now().date()

        # Today's stats
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
# EnvironmentLog ViewSet
# =============================================================================
class EnvironmentLogViewSet(viewsets.ModelViewSet):
    """
    CRUD for environment readings.
    Uses cursor-based pagination for time-series data.
    """
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
    """
    CRUD for daily productivity metrics.
    Supports filtering by date range and minimum score.
    """
    serializer_class = ProductivityMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = ProductivityMetricFilter
    ordering = ['-date']

    def get_queryset(self):
        return ProductivityMetric.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =============================================================================
# Dashboard ViewSet (read-only, cached)
# =============================================================================
class DashboardViewSet(viewsets.ViewSet):
    """
    Aggregated dashboard data endpoint with Redis caching.
    GET /dashboard/ - returns focus stats, environment, and productivity data.
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

        # Latest environment
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

        # Today's productivity metric
        latest_metric = ProductivityMetric.objects.filter(user=user, date=today).first()

        data = {
            'environment': EnvironmentLogSerializer(latest_env).data if latest_env else None,
            'focus_stats': {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'completion_rate': round(completion_rate, 2),
                'total_focus_time_seconds': total_focus_time,
                'avg_focus_score': round(focus_score, 1),
            },
            'productivity': ProductivityMetricSerializer(latest_metric).data if latest_metric else None,
            'cached_at': timezone.now().isoformat(),
        }

        # Cache the result
        set_dashboard_cache(user.id, data)

        return Response(data)