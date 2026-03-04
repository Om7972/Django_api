"""
FlowSpace AI - URL Configuration
Maps exact paths: /auth/, /users/, /sessions/, /environment/, /ai/, /team/
All included under /api/v1/ from the project urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    # =========================================================================
    # AUTH - Registration, Login, Token Management
    # =========================================================================
    path('auth/register', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login', views.LoginView.as_view(), name='auth-login'),
    path('auth/refresh', views.RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/logout', views.LogoutView.as_view(), name='auth-logout'),

    # =========================================================================
    # USER - Profile Management
    # =========================================================================
    path('users/me', views.UserMeView.as_view(), name='users-me'),

    # =========================================================================
    # FOCUS - Session Management & Analytics
    # =========================================================================
    path('sessions/start', views.SessionStartView.as_view(), name='sessions-start'),
    path('sessions/end', views.SessionEndView.as_view(), name='sessions-end'),
    path('sessions/distraction', views.SessionDistractionLogView.as_view(), name='sessions-distraction'),
    path('sessions/history', views.SessionHistoryView.as_view(), name='sessions-history'),
    path('sessions/analytics', views.SessionAnalyticsView.as_view(), name='sessions-analytics'),

    # =========================================================================
    # ENVIRONMENT - IoT & Workspace Monitoring
    # =========================================================================
    path('environment/log', views.EnvironmentLogView.as_view(), name='environment-log'),
    path('environment/history', views.EnvironmentHistoryView.as_view(), name='environment-history'),

    # =========================================================================
    # AI - Predictions, Optimization, Reports
    # =========================================================================
    path('ai/focus-prediction', views.AIFocusPredictionView.as_view(), name='ai-focus-prediction'),
    path('ai/optimize-environment', views.AIOptimizeEnvironmentView.as_view(), name='ai-optimize-env'),
    path('ai/auto-adjust', views.AIAutoAdjustView.as_view(), name='ai-auto-adjust'),
    path('ai/weekly-report', views.AIWeeklyReportView.as_view(), name='ai-weekly-report'),

    # =========================================================================
    # TEAM - Collaboration & Team Dashboard
    # =========================================================================
    path('team/create', views.TeamCreateView.as_view(), name='team-create'),
    path('team/invite', views.TeamInviteView.as_view(), name='team-invite'),
    path('team/dashboard', views.TeamDashboardView.as_view(), name='team-dashboard'),
]