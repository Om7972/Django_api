import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import EnvironmentLog, FocusSession

class EnvironmentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            # Reject the connection if user is not authenticated
            await self.close()
        else:
            # Accept the connection
            await self.accept()
            # Add to the environment group
            await self.channel_layer.group_add("environment_updates", self.channel_name)

    async def disconnect(self, close_code):
        # Leave the environment group
        await self.channel_layer.group_discard("environment_updates", self.channel_name)

    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass

    async def environment_update(self, event):
        # Send environment update to WebSocket
        await self.send(text_data=json.dumps(event['data']))

class FocusSessionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            # Reject the connection if user is not authenticated
            await self.close()
        else:
            self.session_id = self.scope['url_route']['kwargs']['session_id']
            self.session_group_name = f'focus_session_{self.session_id}'
            
            # Accept the connection
            await self.accept()
            # Add to the session group
            await self.channel_layer.group_add(self.session_group_name, self.channel_name)

    async def disconnect(self, close_code):
        # Leave the session group
        await self.channel_layer.group_discard(self.session_group_name, self.channel_name)

    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass

    async def focus_session_update(self, event):
        # Send focus session update to WebSocket
        await self.send(text_data=json.dumps(event['data']))