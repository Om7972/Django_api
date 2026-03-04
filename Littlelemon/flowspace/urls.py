"""
FlowSpace API URL configuration using DRF Routers.
All endpoints are registered under the router and included via /api/v1/flowspace/.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Core resources
router.register(r'subscription', views.SubscriptionViewSet, basename='subscription')
router.register(r'teams', views.TeamViewSet, basename='team')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')

# Sessions & tracking
router.register(r'sessions', views.FocusSessionViewSet, basename='session')
router.register(r'distractions', views.DistractionEventViewSet, basename='distraction')
router.register(r'environment', views.EnvironmentLogViewSet, basename='environment')
router.register(r'metrics', views.ProductivityMetricViewSet, basename='metric')

# Gamification
router.register(r'achievements', views.AchievementViewSet, basename='achievement')
router.register(r'my-achievements', views.UserAchievementViewSet, basename='user-achievement')
router.register(r'streaks', views.UserStreakViewSet, basename='streak')

# Dashboard (aggregated, cached)
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]