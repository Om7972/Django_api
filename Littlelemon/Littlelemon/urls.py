"""
URL configuration for Littlelemon project.
All API endpoints under /api/v1/
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # =========================================================================
    # API v1 - FlowSpace AI SaaS
    # =========================================================================
    # All flowspace endpoints: /api/v1/auth/, /api/v1/users/, /api/v1/sessions/,
    # /api/v1/environment/, /api/v1/ai/, /api/v1/team/
    path('api/v1/', include('flowspace.urls')),

    # Restaurant API (LittlelemonAPI)
    path('api/v1/restaurant/', include('LittlelemonAPI.urls')),

    # DRF browsable API login (dev only)
    path('api-auth/', include('rest_framework.urls')),
]