"""
FlowSpace API URL configuration using DRF Routers.
All endpoints are registered under the router and included via /api/v1/flowspace/.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet, basename='team')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'sessions', views.FocusSessionViewSet, basename='session')
router.register(r'environment', views.EnvironmentLogViewSet, basename='environment')
router.register(r'metrics', views.ProductivityMetricViewSet, basename='metric')
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]