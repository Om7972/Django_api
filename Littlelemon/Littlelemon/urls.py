"""
URL configuration for Littlelemon project.
API versioning: all endpoints under /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

# =============================================================================
# Versioned API URLs
# =============================================================================
api_v1_patterns = [
    # JWT Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Djoser - registration, email verification, password reset
    path('auth/', include('djoser.urls')),

    # FlowSpace API (ViewSets via Router)
    path('flowspace/', include('flowspace.urls')),

    # LittlelemonAPI (restaurant endpoints)
    path('restaurant/', include('LittlelemonAPI.urls')),
]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/', include((api_v1_patterns, 'api-v1'))),

    # DRF browsable API login (dev only)
    path('api-auth/', include('rest_framework.urls')),
]