"""
WebSocket Consumers for real-time FlowSpace AI features.
Requires JWT authentication via querystring (?token=<access_token>).
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger('flowspace')

class PersonalDashboardConsumer(AsyncWebsocketConsumer):
    """
    Subscribes the user to their personal real-time updates:
    - Environment readings
    - Live focus score updates
    - Streak changes
    """
    async def connect(self):
        user = self.scope.get("user", AnonymousUser())
        if user.is_anonymous:
            await self.close(code=4001)
            return

        self.user_group_name = f"user_{user.id}_dashboard"
        
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"WebSocket connect: {user.username} to {self.user_group_name}")

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def dashboard_update(self, event):
        """Send specific dashboard updates (env configs, achievements, etc.)"""
        await self.send(text_data=json.dumps({
            'type': event.get('update_type', 'update'),
            'data': event['data']
        }))


class FocusSessionConsumer(AsyncWebsocketConsumer):
    """
    Subscribes to live updates during a specific focus session
    (e.g., ticking duration, live distraction logs).
    """
    async def connect(self):
        user = self.scope.get("user", AnonymousUser())
        if user.is_anonymous:
            await self.close(code=4001)
            return

        self.session_id = self.scope['url_route']['kwargs']['session_id']
        
        # Verify ownership or team access asynchronously
        has_access = await self.check_session_access(user.id, self.session_id)
        if not has_access:
            await self.close(code=4003)
            return

        self.session_group_name = f"focus_session_{self.session_id}"
        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'session_group_name'):
            await self.channel_layer.group_discard(
                self.session_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Client can send focus heartbeat
        pass

    async def session_update(self, event):
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def check_session_access(self, user_id, session_id):
        from .models import FocusSession
        try:
            session = FocusSession.objects.get(id=session_id)
            if session.user_id == user_id:
                return True
            if session.team_id:
                from .models import TeamMembership
                return TeamMembership.objects.filter(team_id=session.team_id, user_id=user_id).exists()
            return False
        except FocusSession.DoesNotExist:
            return False


class TeamDashboardConsumer(AsyncWebsocketConsumer):
    """
    Subscribes to live team updates:
    - Teammates starting/ending sessions
    - Live leaderboard movements
    """
    async def connect(self):
        user = self.scope.get("user", AnonymousUser())
        if user.is_anonymous:
            await self.close(code=4001)
            return

        self.team_id = self.scope['url_route']['kwargs']['team_id']
        
        # Verify team access asynchronously
        has_access = await self.check_team_access(user.id, self.team_id)
        if not has_access:
            await self.close(code=4003)
            return

        self.team_group_name = f"team_{self.team_id}_dashboard"
        await self.channel_layer.group_add(
            self.team_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"WebSocket connect: {user.username} to {self.team_group_name}")

    async def disconnect(self, close_code):
        if hasattr(self, 'team_group_name'):
            await self.channel_layer.group_discard(
                self.team_group_name,
                self.channel_name
            )

    async def team_update(self, event):
        await self.send(text_data=json.dumps({
            'type': event.get('update_type', 'update'),
            'data': event['data']
        }))

    @database_sync_to_async
    def check_team_access(self, user_id, team_id):
        from .models import TeamMembership
        return TeamMembership.objects.filter(team_id=team_id, user_id=user_id).exists()