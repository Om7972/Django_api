"""
FlowSpace AI - Full REST API Views
Organized by domain: Auth, User, Focus, Environment, AI, Team.
All endpoints under /api/v1/
"""

import logging
import random
from datetime import timedelta

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Sum, Count, F, Q
from django.db.models.functions import TruncDate, TruncHour

from .models import (
    Subscription, Team, TeamMembership, TeamWorkspace,
    UserProfile, FocusSession, DistractionEvent,
    EnvironmentLog, ProductivityMetric,
    Achievement, UserAchievement, UserStreak,
)
from .serializers import (
    RegisterSerializer, LoginSerializer, LogoutSerializer,
    UserMeSerializer, UserUpdateSerializer,
    FocusSessionStartSerializer, FocusSessionEndSerializer, FocusSessionSerializer,
    EnvironmentLogCreateSerializer, EnvironmentLogSerializer,
    EnvironmentOptimizeSerializer,
    TeamCreateSerializer, TeamInviteSerializer, TeamSerializer,
    TeamMembershipSerializer,
    ProductivityMetricSerializer,
    UserStreakSerializer, UserAchievementSerializer,
)
from .cache import (
    get_dashboard_cache, set_dashboard_cache, invalidate_dashboard_cache,
    get_focus_score_cache, set_focus_score_cache, invalidate_focus_score_cache,
)

logger = logging.getLogger('flowspace')


# =============================================================================
# AUTH ENDPOINTS
# =============================================================================
class RegisterView(APIView):
    """
    POST /api/v1/auth/register

    Register a new user. Auto-creates profile, subscription (free), and streak.

    Request:
        {
            "username": "flowuser",
            "email": "flow@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "Flow",
            "last_name": "User"
        }

    Response 201:
        {
            "user": { "id": 1, "username": "flowuser", "email": "flow@example.com" },
            "tokens": { "access": "eyJ...", "refresh": "eyJ..." },
            "message": "Account created successfully."
        }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = RefreshToken.for_user(user)
        logger.info('New user registered: %s', user.username)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'access': str(tokens.access_token),
                'refresh': str(tokens),
            },
            'message': 'Account created successfully.',
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/v1/auth/login

    Authenticate with email + password. Returns JWT tokens.

    Request:
        { "email": "flow@example.com", "password": "SecurePass123!" }

    Response 200:
        {
            "user": { "id": 1, "username": "flowuser", "email": "flow@example.com" },
            "tokens": { "access": "eyJ...", "refresh": "eyJ..." }
        }

    Response 401:
        { "error": "invalid_credentials", "message": "Invalid email or password." }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # Look up user by email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'invalid_credentials',
                'message': 'Invalid email or password.',
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            return Response({
                'error': 'invalid_credentials',
                'message': 'Invalid email or password.',
            }, status=status.HTTP_401_UNAUTHORIZED)

        tokens = RefreshToken.for_user(user)
        logger.info('User logged in: %s', user.username)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'access': str(tokens.access_token),
                'refresh': str(tokens),
            },
        })


class RefreshTokenView(APIView):
    """
    POST /api/v1/auth/refresh

    Get a new access token using a refresh token.

    Request:
        { "refresh": "eyJ..." }

    Response 200:
        { "access": "eyJ...", "refresh": "eyJ..." }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'missing_token',
                'message': 'Refresh token is required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            return Response({
                'access': str(token.access_token),
                'refresh': str(token),
            })
        except TokenError:
            return Response({
                'error': 'invalid_token',
                'message': 'Token is invalid or expired.',
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout

    Blacklist the refresh token to log out.

    Request:
        { "refresh": "eyJ..." }

    Response 200:
        { "message": "Successfully logged out." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            token.blacklist()
            logger.info('User logged out: %s', request.user.username)
            return Response({'message': 'Successfully logged out.'})
        except TokenError:
            return Response({
                'error': 'invalid_token',
                'message': 'Token is invalid or already blacklisted.',
            }, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# USER ENDPOINTS
# =============================================================================
class UserMeView(APIView):
    """
    GET    /api/v1/users/me   - Get full user profile
    PATCH  /api/v1/users/me   - Update user fields
    DELETE /api/v1/users/me   - Deactivate account

    GET Response 200:
        {
            "id": 1,
            "username": "flowuser",
            "email": "flow@example.com",
            "first_name": "Flow",
            "last_name": "User",
            "date_joined": "2026-03-01T12:00:00Z",
            "profile": {
                "role": "user",
                "email_verified": true,
                "preferred_temperature": 22.0,
                "focus_duration_preference": 25,
                ...
            },
            "subscription": { "plan": "pro", "is_active": true, ... },
            "streak": { "current_streak_days": 14, ... }
        }

    PATCH Request:
        { "first_name": "NewName", "preferred_temperature": 23.5 }

    DELETE Response 200:
        { "message": "Account deactivated successfully." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full user data
        return Response(UserMeSerializer(request.user).data)

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save()
        logger.info('User deactivated: %s', user.username)
        return Response({'message': 'Account deactivated successfully.'})


# =============================================================================
# FOCUS SESSION ENDPOINTS
# =============================================================================
class SessionStartView(APIView):
    """
    POST /api/v1/sessions/start

    Start a new focus session with current environment readings.

    Request:
        {
            "task_type": "deep_work",
            "label": "Sprint planning review",
            "start_temperature": 22.5,
            "start_light_level": 350,
            "start_noise_level": 35,
            "team_id": null
        }

    Response 201:
        {
            "id": 42,
            "task_type": "deep_work",
            "label": "Sprint planning review",
            "start_time": "2026-03-04T13:00:00Z",
            "is_completed": false,
            "focus_score": 0,
            ...
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FocusSessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Check subscription session limit
        sub, _ = Subscription.objects.get_or_create(
            user=request.user, defaults={'plan': 'free', 'status': 'active'}
        )
        today = timezone.now().date()
        today_count = FocusSession.objects.filter(
            user=request.user, start_time__date=today
        ).count()

        if sub.max_sessions_per_day > 0 and today_count >= sub.max_sessions_per_day:
            return Response({
                'error': 'session_limit_reached',
                'message': 'Daily session limit reached. Upgrade to Pro for unlimited sessions.',
                'limit': sub.max_sessions_per_day,
                'used': today_count,
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Check for active (un-ended) sessions
        active = FocusSession.objects.filter(
            user=request.user, end_time__isnull=True
        ).first()
        if active:
            return Response({
                'error': 'session_already_active',
                'message': 'You have an active session. End it before starting a new one.',
                'active_session_id': active.id,
            }, status=status.HTTP_409_CONFLICT)

        team_id = data.pop('team_id', None)
        team = None
        if team_id:
            team = Team.objects.filter(id=team_id).first()

        session = FocusSession.objects.create(
            user=request.user,
            team=team,
            start_time=timezone.now(),
            focus_score=0,
            **data,
        )

        invalidate_dashboard_cache(request.user.id)
        logger.info('Session started: %s by %s', session.id, request.user.username)
        return Response(FocusSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class SessionEndView(APIView):
    """
    POST /api/v1/sessions/end

    End an active focus session with final metrics.

    Request:
        {
            "session_id": 42,
            "focus_score": 85,
            "distractions_count": 3,
            "notes": "Great deep work session, finished the API design."
        }

    Response 200:
        {
            "id": 42,
            "is_completed": true,
            "duration_minutes": 47.3,
            "focus_score": 85,
            "streak": { "current_streak_days": 15, ... },
            ...
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FocusSessionEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            session = FocusSession.objects.get(
                id=data['session_id'], user=request.user
            )
        except FocusSession.DoesNotExist:
            return Response({
                'error': 'session_not_found',
                'message': 'Session not found or does not belong to you.',
            }, status=status.HTTP_404_NOT_FOUND)

        if session.end_time:
            return Response({
                'error': 'session_already_ended',
                'message': 'This session has already been ended.',
            }, status=status.HTTP_400_BAD_REQUEST)

        session.end_time = timezone.now()
        session.duration = session.end_time - session.start_time
        session.is_completed = True
        session.focus_score = data['focus_score']
        session.distractions_count = data['distractions_count']
        session.notes = data.get('notes', '')
        session.save()

        # Update streak
        streak, _ = UserStreak.objects.get_or_create(user=request.user)
        streak.update_streak()

        invalidate_dashboard_cache(request.user.id)
        invalidate_focus_score_cache(request.user.id)

        logger.info('Session ended: %s (score: %s)', session.id, session.focus_score)

        response_data = FocusSessionSerializer(session).data
        response_data['streak'] = UserStreakSerializer(streak).data
        return Response(response_data)


class SessionHistoryView(APIView):
    """
    GET /api/v1/sessions/history

    Get paginated focus session history with filtering.

    Query Parameters:
        ?page=1&page_size=20
        ?task_type=coding
        ?is_completed=true
        ?start_date=2026-01-01&end_date=2026-03-01
        ?ordering=-focus_score

    Response 200:
        {
            "count": 148,
            "next": "/api/v1/sessions/history?page=2",
            "previous": null,
            "results": [ { session objects... } ]
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = FocusSession.objects.filter(
            user=request.user
        ).select_related('user', 'team').prefetch_related('distraction_events')

        # Filters
        task_type = request.query_params.get('task_type')
        if task_type:
            sessions = sessions.filter(task_type=task_type)

        is_completed = request.query_params.get('is_completed')
        if is_completed is not None:
            sessions = sessions.filter(is_completed=is_completed.lower() == 'true')

        start_date = request.query_params.get('start_date')
        if start_date:
            sessions = sessions.filter(start_time__date__gte=start_date)

        end_date = request.query_params.get('end_date')
        if end_date:
            sessions = sessions.filter(start_time__date__lte=end_date)

        min_score = request.query_params.get('min_score')
        if min_score:
            sessions = sessions.filter(focus_score__gte=int(min_score))

        # Ordering
        ordering = request.query_params.get('ordering', '-start_time')
        allowed_orderings = [
            'start_time', '-start_time', 'focus_score', '-focus_score',
            'distractions_count', '-distractions_count',
        ]
        if ordering in allowed_orderings:
            sessions = sessions.order_by(ordering)
        else:
            sessions = sessions.order_by('-start_time')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        total = sessions.count()
        page_sessions = sessions[start_idx:end_idx]

        base_url = request.build_absolute_uri(request.path)
        next_url = None
        prev_url = None
        if end_idx < total:
            next_url = base_url + '?page=' + str(page + 1) + '&page_size=' + str(page_size)
        if page > 1:
            prev_url = base_url + '?page=' + str(page - 1) + '&page_size=' + str(page_size)

        return Response({
            'count': total,
            'next': next_url,
            'previous': prev_url,
            'results': FocusSessionSerializer(page_sessions, many=True).data,
        })


class SessionAnalyticsView(APIView):
    """
    GET /api/v1/sessions/analytics

    Get comprehensive focus analytics.

    Query Parameters:
        ?period=week   (day, week, month, all)

    Response 200:
        {
            "period": "week",
            "summary": {
                "total_sessions": 24,
                "completed_sessions": 20,
                "completion_rate": 0.83,
                "avg_focus_score": 78.4,
                "total_focus_minutes": 580.5,
                "total_distractions": 35
            },
            "daily_breakdown": [ { "date": "2026-03-01", "sessions": 4, ... } ],
            "by_task_type": { "coding": 10, "deep_work": 8, ... },
            "top_distraction_types": { "phone": 12, "email": 8, ... },
            "streak": { "current_streak_days": 14, ... },
            "trends": { "score_trend": "improving", "score_change": +5.2 }
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        today = timezone.now().date()

        # Determine date range
        if period == 'day':
            start_date = today
        elif period == 'month':
            start_date = today - timedelta(days=30)
        elif period == 'all':
            start_date = None
        else:  # week (default)
            start_date = today - timedelta(days=7)

        sessions = FocusSession.objects.filter(user=request.user)
        if start_date:
            sessions = sessions.filter(start_time__date__gte=start_date)

        total = sessions.count()
        completed = sessions.filter(is_completed=True).count()
        agg = sessions.aggregate(
            avg_score=Avg('focus_score'),
            total_distractions=Sum('distractions_count'),
        )
        total_minutes = sum(
            (s.duration.total_seconds() / 60 if s.duration else 0 for s in sessions), 0
        )

        # Daily breakdown
        daily = (
            sessions.annotate(date=TruncDate('start_time'))
            .values('date')
            .annotate(
                sessions_count=Count('id'),
                completed_count=Count('id', filter=Q(is_completed=True)),
                avg_score=Avg('focus_score'),
                total_distractions=Sum('distractions_count'),
            )
            .order_by('date')
        )

        # By task type
        by_type = dict(
            sessions.values_list('task_type')
            .annotate(count=Count('id'))
            .values_list('task_type', 'count')
        )

        # Top distraction types
        distractions = DistractionEvent.objects.filter(user=request.user)
        if start_date:
            distractions = distractions.filter(timestamp__date__gte=start_date)
        top_distractions = dict(
            distractions.values_list('distraction_type')
            .annotate(count=Count('id'))
            .order_by('-count')
            .values_list('distraction_type', 'count')[:5]
        )

        # Streak
        streak, _ = UserStreak.objects.get_or_create(user=request.user)

        # Trend analysis (compare this period vs previous)
        score_trend = 'stable'
        score_change = 0.0
        if start_date and period != 'all':
            delta = today - start_date
            prev_start = start_date - delta
            prev_sessions = FocusSession.objects.filter(
                user=request.user,
                start_time__date__gte=prev_start,
                start_time__date__lt=start_date,
            )
            prev_avg = prev_sessions.aggregate(avg=Avg('focus_score'))['avg']
            curr_avg = agg['avg_score'] or 0
            if prev_avg and curr_avg:
                score_change = round(curr_avg - prev_avg, 1)
                if score_change > 2:
                    score_trend = 'improving'
                elif score_change < -2:
                    score_trend = 'declining'

        return Response({
            'period': period,
            'date_range': {
                'start': str(start_date) if start_date else 'all_time',
                'end': str(today),
            },
            'summary': {
                'total_sessions': total,
                'completed_sessions': completed,
                'completion_rate': round(completed / total, 2) if total > 0 else 0,
                'avg_focus_score': round(agg['avg_score'] or 0, 1),
                'total_focus_minutes': round(total_minutes, 1),
                'total_distractions': agg['total_distractions'] or 0,
            },
            'daily_breakdown': [
                {
                    'date': str(d['date']),
                    'sessions': d['sessions_count'],
                    'completed': d['completed_count'],
                    'avg_score': round(d['avg_score'] or 0, 1),
                    'distractions': d['total_distractions'] or 0,
                }
                for d in daily
            ],
            'by_task_type': by_type,
            'top_distraction_types': top_distractions,
            'streak': UserStreakSerializer(streak).data,
            'trends': {
                'score_trend': score_trend,
                'score_change': score_change,
            },
        })


# =============================================================================
# ENVIRONMENT ENDPOINTS
# =============================================================================
class EnvironmentLogView(APIView):
    """
    POST /api/v1/environment/log

    Log a new workspace environment reading.

    Request:
        {
            "temperature": 22.5,
            "light_level": 350,
            "noise_level": 35,
            "hue_lights_status": "on:warm:80%",
            "nest_thermostat_status": "heating:22.5",
            "smart_plugs_status": "desk_lamp:on"
        }

    Response 201:
        {
            "id": 1021,
            "timestamp": "2026-03-04T13:20:00Z",
            "temperature": 22.5,
            "light_level": 350,
            "noise_level": 35,
            ...
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EnvironmentLogCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        log = EnvironmentLog.objects.create(
            user=request.user,
            **serializer.validated_data,
        )

        invalidate_dashboard_cache(request.user.id)
        return Response(EnvironmentLogSerializer(log).data, status=status.HTTP_201_CREATED)


class EnvironmentHistoryView(APIView):
    """
    GET /api/v1/environment/history

    Get paginated environment reading history.

    Query Parameters:
        ?page=1&page_size=50
        ?start_date=2026-03-01T00:00:00Z
        ?end_date=2026-03-04T23:59:59Z

    Response 200:
        {
            "count": 4520,
            "next": "...?page=2",
            "previous": null,
            "results": [ { environment logs... } ]
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = EnvironmentLog.objects.filter(
            user=request.user
        ).order_by('-timestamp')

        start_date = request.query_params.get('start_date')
        if start_date:
            logs = logs.filter(timestamp__gte=start_date)

        end_date = request.query_params.get('end_date')
        if end_date:
            logs = logs.filter(timestamp__lte=end_date)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 50)), 200)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        total = logs.count()
        page_logs = logs[start_idx:end_idx]

        base_url = request.build_absolute_uri(request.path)
        next_url = None
        prev_url = None
        if end_idx < total:
            next_url = base_url + '?page=' + str(page + 1) + '&page_size=' + str(page_size)
        if page > 1:
            prev_url = base_url + '?page=' + str(page - 1) + '&page_size=' + str(page_size)

        return Response({
            'count': total,
            'next': next_url,
            'previous': prev_url,
            'results': EnvironmentLogSerializer(page_logs, many=True).data,
        })


# =============================================================================
# AI ENDPOINTS
# =============================================================================
class AIFocusPredictionView(APIView):
    """
    GET /api/v1/ai/focus-prediction

    Predict focus score based on current environment, time of day, and historical data.

    Query Parameters:
        ?task_type=coding  (optional, defaults to deep_work)

    Response 200:
        {
            "predicted_focus_score": 82,
            "confidence": 0.78,
            "factors": {
                "time_of_day": { "score_impact": +5, "label": "Peak hours (10AM-12PM)" },
                "streak_bonus": { "score_impact": +3, "label": "14-day streak bonus" },
                "task_type_avg": { "score_impact": -2, "label": "Coding avg is 76" },
                "environment": { "score_impact": +4, "label": "Optimal environment detected" }
            },
            "recommendation": "Great time for coding! Your focus peaks between 10AM-12PM.",
            "optimal_session_duration": 45
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        task_type = request.query_params.get('task_type', 'deep_work')
        user = request.user
        now = timezone.now()

        # === Gather historical data ===

        # Avg score for this task type
        type_sessions = FocusSession.objects.filter(
            user=user, task_type=task_type, is_completed=True
        )
        type_avg = type_sessions.aggregate(avg=Avg('focus_score'))['avg'] or 65

        # Avg score at this hour of day
        current_hour = now.hour
        hourly_sessions = FocusSession.objects.filter(
            user=user, is_completed=True, start_time__hour=current_hour
        )
        hourly_avg = hourly_sessions.aggregate(avg=Avg('focus_score'))['avg'] or type_avg

        # Get latest environment
        latest_env = EnvironmentLog.objects.filter(user=user).order_by('-timestamp').first()

        # Get user preferences
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # Get streak
        streak, _ = UserStreak.objects.get_or_create(user=user)

        # === Build prediction ===
        base_score = round((type_avg + hourly_avg) / 2, 1)
        factors = {}

        # Time of day factor
        if 9 <= current_hour <= 11:
            time_impact = 5
            time_label = 'Peak focus hours (9AM-12PM)'
        elif 14 <= current_hour <= 16:
            time_impact = 3
            time_label = 'Good afternoon focus window'
        elif current_hour >= 22 or current_hour <= 5:
            time_impact = -8
            time_label = 'Late night - reduced focus expected'
        else:
            time_impact = 0
            time_label = 'Normal focus period'
        factors['time_of_day'] = {'score_impact': time_impact, 'label': time_label}

        # Streak bonus
        streak_impact = min(streak.current_streak_days, 10)  # Cap at +10
        streak_label = str(streak.current_streak_days) + '-day streak bonus'
        if streak.current_streak_days == 0:
            streak_impact = -3
            streak_label = 'No active streak - building momentum'
        factors['streak_bonus'] = {'score_impact': streak_impact, 'label': streak_label}

        # Task type factor
        overall_avg = FocusSession.objects.filter(
            user=user, is_completed=True
        ).aggregate(avg=Avg('focus_score'))['avg'] or 65
        type_diff = round(type_avg - overall_avg, 1)
        factors['task_type_avg'] = {
            'score_impact': round(type_diff),
            'label': task_type.replace('_', ' ').title() + ' avg is ' + str(round(type_avg)),
        }

        # Environment factor
        env_impact = 0
        env_label = 'No environment data'
        if latest_env:
            temp_ok = abs(latest_env.temperature - profile.preferred_temperature) < 3
            light_ok = abs(latest_env.light_level - profile.preferred_light_level) < 100
            noise_ok = abs(latest_env.noise_level - profile.preferred_noise_level) < 15
            matches = sum([temp_ok, light_ok, noise_ok])
            if matches == 3:
                env_impact = 5
                env_label = 'Optimal environment detected'
            elif matches == 2:
                env_impact = 2
                env_label = 'Good environment conditions'
            elif matches == 1:
                env_impact = -2
                env_label = 'Sub-optimal environment'
            else:
                env_impact = -5
                env_label = 'Poor environment conditions'
        factors['environment'] = {'score_impact': env_impact, 'label': env_label}

        # Calculate final prediction
        total_impact = sum(f['score_impact'] for f in factors.values())
        predicted = max(0, min(100, round(base_score + total_impact)))

        # Confidence based on data volume
        data_count = type_sessions.count()
        if data_count >= 50:
            confidence = 0.85
        elif data_count >= 20:
            confidence = 0.72
        elif data_count >= 5:
            confidence = 0.55
        else:
            confidence = 0.35

        # Optimal duration recommendation
        best_duration_data = (
            type_sessions.exclude(duration__isnull=True)
            .filter(focus_score__gte=75)
            .values_list('duration', flat=True)[:20]
        )
        if best_duration_data:
            avg_duration = sum(d.total_seconds() for d in best_duration_data) / len(best_duration_data)
            optimal_duration = round(avg_duration / 60 / 5) * 5  # Round to nearest 5 min
            optimal_duration = max(15, min(90, optimal_duration))
        else:
            optimal_duration = profile.focus_duration_preference

        # Recommendation text
        if predicted >= 80:
            recommendation = 'Excellent conditions for ' + task_type.replace('_', ' ') + '! Start a session now.'
        elif predicted >= 60:
            recommendation = 'Good conditions. Consider optimizing your environment for better focus.'
        else:
            recommendation = 'Conditions may not be ideal. Try adjusting your environment first.'

        return Response({
            'predicted_focus_score': predicted,
            'confidence': confidence,
            'factors': factors,
            'recommendation': recommendation,
            'optimal_session_duration': optimal_duration,
        })


class AIOptimizeEnvironmentView(APIView):
    """
    POST /api/v1/ai/optimize-environment

    Get AI recommendations to optimize your workspace environment.

    Request:
        {
            "current_temperature": 25.0,
            "current_light_level": 200,
            "current_noise_level": 55,
            "task_type": "coding"
        }

    Response 200:
        {
            "recommendations": [
                {
                    "parameter": "temperature",
                    "current": 25.0,
                    "optimal": 22.0,
                    "action": "decrease",
                    "impact": "high",
                    "message": "Lower temperature by 3C. Cooler rooms improve focus by ~12%."
                },
                ...
            ],
            "predicted_score_improvement": 8,
            "optimal_environment": {
                "temperature": 22.0,
                "light_level": 350,
                "noise_level": 40
            },
            "device_commands": [
                { "device": "nest_thermostat", "action": "set_temperature", "value": 22.0 },
                { "device": "hue_lights", "action": "set_brightness", "value": 70 }
            ]
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EnvironmentOptimizeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        task_type = data['task_type']

        # Get user's optimal environment from their best sessions
        best_sessions = FocusSession.objects.filter(
            user=user, task_type=task_type, is_completed=True, focus_score__gte=75
        ).order_by('-focus_score')[:20]

        if best_sessions.exists():
            optimal_temp = round(best_sessions.aggregate(
                avg=Avg('start_temperature')
            )['avg'], 1)
            optimal_light = round(best_sessions.aggregate(
                avg=Avg('start_light_level')
            )['avg'])
            optimal_noise = round(best_sessions.aggregate(
                avg=Avg('start_noise_level')
            )['avg'])
        else:
            # Use profile preferences as fallback
            profile, _ = UserProfile.objects.get_or_create(user=user)
            optimal_temp = profile.preferred_temperature
            optimal_light = profile.preferred_light_level
            optimal_noise = profile.preferred_noise_level

        recommendations = []
        device_commands = []
        total_improvement = 0

        # Temperature analysis
        temp_diff = data['current_temperature'] - optimal_temp
        if abs(temp_diff) > 1.5:
            action = 'decrease' if temp_diff > 0 else 'increase'
            impact = 'high' if abs(temp_diff) > 3 else 'medium'
            improvement = min(5, round(abs(temp_diff) * 1.5))
            total_improvement += improvement
            recommendations.append({
                'parameter': 'temperature',
                'current': data['current_temperature'],
                'optimal': optimal_temp,
                'action': action,
                'impact': impact,
                'message': action.title() + ' temperature by ' + str(round(abs(temp_diff), 1)) + 'C for better focus.',
            })
            device_commands.append({
                'device': 'nest_thermostat',
                'action': 'set_temperature',
                'value': optimal_temp,
            })

        # Light analysis
        light_diff = data['current_light_level'] - optimal_light
        if abs(light_diff) > 50:
            action = 'decrease' if light_diff > 0 else 'increase'
            impact = 'high' if abs(light_diff) > 150 else 'medium'
            improvement = min(4, round(abs(light_diff) / 50))
            total_improvement += improvement
            brightness_pct = min(100, max(10, round(optimal_light / 10)))
            recommendations.append({
                'parameter': 'light_level',
                'current': data['current_light_level'],
                'optimal': optimal_light,
                'action': action,
                'impact': impact,
                'message': action.title() + ' lighting by ' + str(abs(light_diff)) + ' lux. Adjust to ' + str(brightness_pct) + '% brightness.',
            })
            device_commands.append({
                'device': 'hue_lights',
                'action': 'set_brightness',
                'value': brightness_pct,
            })

        # Noise analysis
        noise_diff = data['current_noise_level'] - optimal_noise
        if abs(noise_diff) > 10:
            action = 'decrease' if noise_diff > 0 else 'increase'
            impact = 'high' if abs(noise_diff) > 20 else 'medium'
            improvement = min(4, round(abs(noise_diff) / 8))
            total_improvement += improvement
            recommendations.append({
                'parameter': 'noise_level',
                'current': data['current_noise_level'],
                'optimal': optimal_noise,
                'action': action,
                'impact': impact,
                'message': 'Noise level is ' + str(abs(noise_diff)) + 'dB off optimal. Try noise-cancelling or ambient sounds.',
            })
            device_commands.append({
                'device': 'smart_speaker',
                'action': 'play_ambient',
                'value': 'white_noise' if noise_diff > 0 else 'nature_sounds',
            })

        if not recommendations:
            recommendations.append({
                'parameter': 'all',
                'current': None,
                'optimal': None,
                'action': 'none',
                'impact': 'none',
                'message': 'Your environment is already optimized! Start a focus session.',
            })

        return Response({
            'recommendations': recommendations,
            'predicted_score_improvement': min(15, total_improvement),
            'optimal_environment': {
                'temperature': optimal_temp,
                'light_level': optimal_light,
                'noise_level': optimal_noise,
            },
            'device_commands': device_commands,
        })


class AIWeeklyReportView(APIView):
    """
    GET /api/v1/ai/weekly-report

    Get AI-generated weekly productivity report with insights and suggestions.

    Response 200:
        {
            "report_period": { "start": "2026-02-25", "end": "2026-03-03" },
            "headline": "Strong week! Focus score up 8% vs last week.",
            "summary": { ... },
            "insights": [ ... ],
            "recommendations": [ ... ],
            "achievements_this_week": [ ... ],
            "next_week_goals": { ... }
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        prev_week_start = week_start - timedelta(days=7)

        # This week's data
        sessions = FocusSession.objects.filter(
            user=user, start_time__date__gte=week_start, start_time__date__lt=today
        )
        total = sessions.count()
        completed = sessions.filter(is_completed=True).count()
        avg_score = sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0
        total_minutes = sum(
            (s.duration.total_seconds() / 60 if s.duration else 0 for s in sessions), 0
        )
        total_distractions = sessions.aggregate(
            total=Sum('distractions_count')
        )['total'] or 0

        # Previous week for comparison
        prev_sessions = FocusSession.objects.filter(
            user=user, start_time__date__gte=prev_week_start, start_time__date__lt=week_start
        )
        prev_avg = prev_sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0
        prev_total = prev_sessions.count()
        prev_minutes = sum(
            (s.duration.total_seconds() / 60 if s.duration else 0 for s in prev_sessions), 0
        )

        # Best day
        best_day = (
            sessions.annotate(day=TruncDate('start_time'))
            .values('day')
            .annotate(avg_score=Avg('focus_score'), count=Count('id'))
            .order_by('-avg_score')
            .first()
        )

        # Best task type
        best_type = (
            sessions.filter(is_completed=True)
            .values('task_type')
            .annotate(avg_score=Avg('focus_score'))
            .order_by('-avg_score')
            .first()
        )

        # Top distraction
        top_distraction = (
            DistractionEvent.objects.filter(
                user=user, timestamp__date__gte=week_start
            )
            .values('distraction_type')
            .annotate(count=Count('id'))
            .order_by('-count')
            .first()
        )

        # Streak
        streak, _ = UserStreak.objects.get_or_create(user=user)

        # New achievements this week
        weekly_achievements = UserAchievement.objects.filter(
            user=user, unlocked_at__date__gte=week_start
        ).select_related('achievement')

        # Build headline
        score_change = round(avg_score - prev_avg, 1) if prev_avg else 0
        if score_change > 5:
            headline = 'Excellent week! Focus score up ' + str(abs(score_change)) + '% vs last week.'
        elif score_change > 0:
            headline = 'Solid week with steady improvement. Keep going!'
        elif score_change > -5:
            headline = 'Consistent week. Small adjustments can boost your score.'
        else:
            headline = 'Challenging week. Review your environment and schedule.'

        # Build insights
        insights = []
        if best_day:
            day_name = best_day['day'].strftime('%A')
            insights.append({
                'type': 'best_day',
                'icon': 'star',
                'message': day_name + ' was your best day with an avg score of ' + str(round(best_day['avg_score'])) + '.',
            })
        if best_type:
            insights.append({
                'type': 'best_task',
                'icon': 'target',
                'message': 'You perform best during ' + best_type['task_type'].replace('_', ' ') + ' sessions.',
            })
        if top_distraction:
            insights.append({
                'type': 'top_distraction',
                'icon': 'alert',
                'message': top_distraction['distraction_type'].replace('_', ' ').title() + ' was your #1 distraction (' + str(top_distraction['count']) + ' times).',
            })
        if streak.current_streak_days >= 7:
            insights.append({
                'type': 'streak',
                'icon': 'fire',
                'message': 'Amazing ' + str(streak.current_streak_days) + '-day streak! Consistency drives results.',
            })

        # Build recommendations
        recommendations = []
        if avg_score < 70:
            recommendations.append('Try shorter sessions (20-25 min) to build focus stamina.')
        if total_distractions > total * 3:
            recommendations.append('High distraction rate. Consider using Focus Mode to block notifications.')
        if total_minutes < 120:
            recommendations.append('Aim for at least 2 hours of focused work daily.')
        if not recommendations:
            recommendations.append('Maintain your current routine - it is working well!')

        return Response({
            'report_period': {
                'start': str(week_start),
                'end': str(today),
            },
            'headline': headline,
            'summary': {
                'total_sessions': total,
                'completed_sessions': completed,
                'completion_rate': round(completed / total, 2) if total > 0 else 0,
                'avg_focus_score': round(avg_score, 1),
                'total_focus_minutes': round(total_minutes, 1),
                'total_distractions': total_distractions,
                'vs_last_week': {
                    'score_change': score_change,
                    'session_change': total - prev_total,
                    'time_change_minutes': round(total_minutes - prev_minutes, 1),
                },
            },
            'insights': insights,
            'recommendations': recommendations,
            'achievements_this_week': [
                {
                    'name': ua.achievement.name,
                    'icon': ua.achievement.icon,
                    'rarity': ua.achievement.rarity,
                    'unlocked_at': ua.unlocked_at.isoformat(),
                }
                for ua in weekly_achievements
            ],
            'streak': UserStreakSerializer(streak).data,
            'next_week_goals': {
                'target_sessions': max(total + 2, 10),
                'target_score': min(round(avg_score + 3), 95),
                'target_focus_minutes': round(max(total_minutes * 1.1, 300), 0),
            },
        })


# =============================================================================
# TEAM ENDPOINTS
# =============================================================================
class TeamCreateView(APIView):
    """
    POST /api/v1/team/create

    Create a new team. The creator becomes the team owner and admin.

    Request:
        { "name": "Engineering Team", "slug": "engineering" }

    Response 201:
        {
            "id": 5,
            "name": "Engineering Team",
            "slug": "engineering",
            "owner": { "id": 1, "username": "flowuser" },
            "members_count": 1,
            "created_at": "2026-03-04T13:00:00Z"
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Check subscription team limit
        sub, _ = Subscription.objects.get_or_create(
            user=request.user, defaults={'plan': 'free', 'status': 'active'}
        )
        if sub.max_team_members <= 0 and sub.plan == 'free':
            return Response({
                'error': 'upgrade_required',
                'message': 'Teams require a Pro or Enterprise subscription.',
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = TeamCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        team = Team.objects.create(
            name=serializer.validated_data['name'],
            slug=serializer.validated_data['slug'],
            owner=request.user,
        )
        TeamMembership.objects.create(user=request.user, team=team, role='admin')
        TeamWorkspace.objects.create(team=team)

        logger.info('Team created: %s by %s', team.name, request.user.username)
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)


class TeamInviteView(APIView):
    """
    POST /api/v1/team/invite

    Invite a user to a team. Only team owner or admin can invite.

    Request:
        { "team_id": 5, "username": "colleague", "role": "member" }

    Response 201:
        {
            "id": 12,
            "user": { "id": 3, "username": "colleague" },
            "role": "member",
            "joined_at": "2026-03-04T14:00:00Z"
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TeamInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        team = Team.objects.get(id=data['team_id'])

        # Permission: must be owner or admin
        is_owner = team.owner == request.user
        is_admin = TeamMembership.objects.filter(
            user=request.user, team=team, role='admin'
        ).exists()

        if not (is_owner or is_admin):
            return Response({
                'error': 'permission_denied',
                'message': 'Only team owner or admin can invite members.',
            }, status=status.HTTP_403_FORBIDDEN)

        # Check team member limit
        sub, _ = Subscription.objects.get_or_create(
            user=team.owner, defaults={'plan': 'free', 'status': 'active'}
        )
        current_count = team.memberships.count()
        if sub.max_team_members > 0 and current_count >= sub.max_team_members:
            return Response({
                'error': 'team_member_limit',
                'message': 'Team member limit reached. Upgrade to add more members.',
                'limit': sub.max_team_members,
                'current': current_count,
            }, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.get(username=data['username'])
        membership, created = TeamMembership.objects.get_or_create(
            user=user, team=team, defaults={'role': data['role']}
        )

        if not created:
            return Response({
                'error': 'already_member',
                'message': 'User is already a member of this team.',
            }, status=status.HTTP_400_BAD_REQUEST)

        logger.info('User %s invited to team %s', user.username, team.name)
        return Response(TeamMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class TeamDashboardView(APIView):
    """
    GET /api/v1/team/dashboard

    Get aggregated team dashboard with leaderboard.

    Query Parameters:
        ?team_id=5   (required)

    Response 200:
        {
            "team": { "id": 5, "name": "Engineering Team", ... },
            "stats": {
                "total_sessions_today": 42,
                "avg_focus_score": 81.3,
                "active_members_today": 8,
                "total_focus_minutes": 1580
            },
            "leaderboard": [
                { "rank": 1, "username": "flowuser", "avg_score": 92, "sessions": 5 },
                ...
            ],
            "recent_activity": [ ... ]
        }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({
                'error': 'missing_parameter',
                'message': 'team_id query parameter is required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({
                'error': 'team_not_found',
                'message': 'Team not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        # Verify membership
        is_member = TeamMembership.objects.filter(
            user=request.user, team=team
        ).exists()
        if not is_member and team.owner != request.user:
            return Response({
                'error': 'not_a_member',
                'message': 'You are not a member of this team.',
            }, status=status.HTTP_403_FORBIDDEN)

        today = timezone.now().date()
        member_ids = team.memberships.values_list('user_id', flat=True)

        # Team sessions today
        team_sessions = FocusSession.objects.filter(
            user_id__in=member_ids, start_time__date=today
        )
        total_sessions = team_sessions.count()
        avg_score = team_sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0
        active_members = team_sessions.values('user').distinct().count()
        total_minutes = sum(
            (s.duration.total_seconds() / 60 if s.duration else 0 for s in team_sessions),
            0
        )

        # Leaderboard
        leaderboard_data = (
            team_sessions.filter(is_completed=True)
            .values('user__id', 'user__username')
            .annotate(
                avg_score=Avg('focus_score'),
                sessions=Count('id'),
            )
            .order_by('-avg_score')
        )

        leaderboard = []
        for rank, entry in enumerate(leaderboard_data, 1):
            leaderboard.append({
                'rank': rank,
                'user_id': entry['user__id'],
                'username': entry['user__username'],
                'avg_score': round(entry['avg_score'], 1),
                'sessions': entry['sessions'],
            })

        # Recent activity (last 10 completed sessions)
        recent = (
            FocusSession.objects.filter(
                user_id__in=member_ids, is_completed=True
            )
            .select_related('user')
            .order_by('-end_time')[:10]
        )
        recent_activity = [
            {
                'username': s.user.username,
                'task_type': s.task_type,
                'focus_score': s.focus_score,
                'duration_minutes': round(s.duration.total_seconds() / 60, 1) if s.duration else 0,
                'ended_at': s.end_time.isoformat() if s.end_time else None,
            }
            for s in recent
        ]

        return Response({
            'team': TeamSerializer(team).data,
            'stats': {
                'total_sessions_today': total_sessions,
                'avg_focus_score': round(avg_score, 1),
                'active_members_today': active_members,
                'total_focus_minutes': round(total_minutes, 1),
            },
            'leaderboard': leaderboard,
            'recent_activity': recent_activity,
        })