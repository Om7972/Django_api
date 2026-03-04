"""
DRF Serializers for the FlowSpace app.
Explicit field declarations with input validation.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Team, TeamMembership, UserProfile,
    FocusSession, EnvironmentLog, ProductivityMetric,
)


# =============================================================================
# User Serializers
# =============================================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class UserMiniSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for nested representations."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        read_only_fields = fields


# =============================================================================
# Team Serializers
# =============================================================================
class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ('id', 'user', 'role', 'joined_at')
        read_only_fields = ('id', 'joined_at')


class TeamSerializer(serializers.ModelSerializer):
    owner = UserMiniSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    memberships = TeamMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'slug', 'owner', 'members_count', 'memberships', 'created_at')
        read_only_fields = ('id', 'owner', 'created_at')

    def get_members_count(self, obj):
        return obj.memberships.count()


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('name', 'slug')

    def validate_slug(self, value):
        if Team.objects.filter(slug=value).exists():
            raise serializers.ValidationError('A team with this slug already exists.')
        return value


class AddTeamMemberSerializer(serializers.Serializer):
    """Serializer for adding a member to a team."""
    username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=TeamMembership.ROLE_CHOICES, default='member')

    def validate_username(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')
        return value


# =============================================================================
# Profile Serializer
# =============================================================================
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'role', 'email_verified',
            'preferred_temperature', 'preferred_light_level', 'preferred_noise_level',
            'focus_duration_preference', 'break_duration_preference',
            'philips_hue_bridge_ip', 'nest_token', 'smart_plug_ids',
            'phone_sync_enabled', 'calendar_integration_enabled', 'browser_focus_mode_enabled',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'role', 'email_verified', 'created_at', 'updated_at')

    def validate_preferred_temperature(self, value):
        if not (15.0 <= value <= 35.0):
            raise serializers.ValidationError('Temperature must be between 15C and 35C.')
        return value

    def validate_preferred_light_level(self, value):
        if not (0 <= value <= 2000):
            raise serializers.ValidationError('Light level must be between 0 and 2000 lux.')
        return value

    def validate_preferred_noise_level(self, value):
        if not (0 <= value <= 120):
            raise serializers.ValidationError('Noise level must be between 0 and 120 dB.')
        return value


# =============================================================================
# Focus Session Serializers
# =============================================================================
class FocusSessionSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = FocusSession
        fields = (
            'id', 'user', 'task_type', 'start_time', 'end_time', 'duration',
            'duration_minutes', 'is_completed', 'start_temperature',
            'start_light_level', 'start_noise_level', 'distractions_count',
            'focus_score', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'duration', 'created_at', 'updated_at')

    def get_duration_minutes(self, obj):
        if obj.duration:
            return round(obj.duration.total_seconds() / 60, 1)
        return None

    def validate_focus_score(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError('Focus score must be between 0 and 100.')
        return value

    def validate_start_temperature(self, value):
        if not (5.0 <= value <= 50.0):
            raise serializers.ValidationError('Temperature must be between 5C and 50C.')
        return value


class FocusSessionStartSerializer(serializers.Serializer):
    """Serializer for starting a new focus session."""
    task_type = serializers.ChoiceField(choices=FocusSession.FOCUS_TASK_TYPES, default='deep_work')
    start_temperature = serializers.FloatField()
    start_light_level = serializers.IntegerField()
    start_noise_level = serializers.IntegerField()
    focus_score = serializers.IntegerField(default=0)


# =============================================================================
# Environment Log Serializer
# =============================================================================
class EnvironmentLogSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = EnvironmentLog
        fields = (
            'id', 'user', 'timestamp', 'temperature', 'light_level', 'noise_level',
            'hue_lights_status', 'nest_thermostat_status', 'smart_plugs_status',
        )
        read_only_fields = ('id', 'user', 'timestamp')

    def validate_temperature(self, value):
        if not (-40.0 <= value <= 60.0):
            raise serializers.ValidationError('Temperature must be between -40C and 60C.')
        return value

    def validate_light_level(self, value):
        if not (0 <= value <= 100000):
            raise serializers.ValidationError('Light level must be between 0 and 100,000 lux.')
        return value

    def validate_noise_level(self, value):
        if not (0 <= value <= 200):
            raise serializers.ValidationError('Noise level must be between 0 and 200 dB.')
        return value


# =============================================================================
# Productivity Metric Serializer
# =============================================================================
class ProductivityMetricSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    total_focus_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = ProductivityMetric
        fields = (
            'id', 'user', 'date', 'total_focus_time', 'total_focus_time_minutes',
            'average_focus_score', 'distractions_count', 'tasks_completed',
            'session_completion_rate', 'optimal_temperature', 'optimal_light_level',
            'optimal_noise_level', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_total_focus_time_minutes(self, obj):
        if obj.total_focus_time:
            return round(obj.total_focus_time.total_seconds() / 60, 1)
        return None