"""
WebSocket routing for FlowSpace AI.
URLs mirror API endpoints: ws/v1/...
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Personal global updates (environment, streaks, notifications)
    re_path(r'^ws/v1/users/me/dashboard/$', consumers.PersonalDashboardConsumer.as_asgi()),
    
    # Real-time focus session metrics
    re_path(r'^ws/v1/sessions/(?P<session_id>\d+)/$', consumers.FocusSessionConsumer.as_asgi()),
    
    # Team live dashboard and leaderboard metrics
    re_path(r'^ws/v1/team/(?P<team_id>\d+)/dashboard/$', consumers.TeamDashboardConsumer.as_asgi()),
]