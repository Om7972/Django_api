"""
DRF Serializers for the FlowSpace AI SaaS app.
Covers Auth, User, Focus, Environment, AI, and Team domains.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Subscription, Team, TeamMembership, TeamWorkspace,
    UserProfile, FocusSession, DistractionEvent,
    EnvironmentLog, ProductivityMetric,
    Achievement, UserAchievement, UserStreak,
)


# =============================================================================
# AUTH SERIALIZERS
# =============================================================================
class RegisterSerializer(serializers.ModelSerializer):
    """POST /auth/register - Create a new user account."""
    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError('Email is required.')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # Auto-create profile, subscription, streak
        UserProfile.objects.create(user=user)
        Subscription.objects.create(user=user, plan='free', status='active')
        UserStreak.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """POST /auth/login - Authenticate and get JWT tokens."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class LogoutSerializer(serializers.Serializer):
    """POST /auth/logout - Blacklist the refresh token."""
    refresh = serializers.CharField(help_text='Refresh token to blacklist')


# =============================================================================
# USER SERIALIZERS
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


class UserMeSerializer(serializers.ModelSerializer):
    """GET /users/me - Full user details with profile, subscription, streak."""
    profile = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'date_joined', 'is_active',
            'profile', 'subscription', 'streak',
        )
        read_only_fields = ('id', 'date_joined', 'is_active')

    def get_profile(self, obj):
        try:
            return UserProfileSerializer(obj.profile).data
        except UserProfile.DoesNotExist:
            return None

    def get_subscription(self, obj):
        try:
            return SubscriptionSerializer(obj.subscription).data
        except Subscription.DoesNotExist:
            return None

    def get_streak(self, obj):
        try:
            return UserStreakSerializer(obj.streak).data
        except UserStreak.DoesNotExist:
            return None


class UserUpdateSerializer(serializers.ModelSerializer):
    """PATCH /users/me - Update user fields + profile fields."""
    preferred_temperature = serializers.FloatField(required=False)
    preferred_light_level = serializers.IntegerField(required=False)
    preferred_noise_level = serializers.IntegerField(required=False)
    focus_duration_preference = serializers.IntegerField(required=False)
    break_duration_preference = serializers.IntegerField(required=False)
    timezone_field = serializers.CharField(required=False, source='profile_timezone')
    avatar_url = serializers.URLField(required=False)

    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'email',
            'preferred_temperature', 'preferred_light_level', 'preferred_noise_level',
            'focus_duration_preference', 'break_duration_preference',
            'timezone_field', 'avatar_url',
        )

    def update(self, instance, validated_data):
        # Extract profile fields
        profile_fields = {}
        for field in [
            'preferred_temperature', 'preferred_light_level', 'preferred_noise_level',
            'focus_duration_preference', 'break_duration_preference', 'avatar_url',
        ]:
            if field in validated_data:
                profile_fields[field] = validated_data.pop(field)

        tz = validated_data.pop('profile_timezone', None)
        if tz:
            profile_fields['timezone'] = tz

        # Update user fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # Update profile fields
        if profile_fields:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, val in profile_fields.items():
                setattr(profile, attr, val)
            profile.save()

        return instance

    def validate_preferred_temperature(self, value):
        if not (15.0 <= value <= 35.0):
            raise serializers.ValidationError('Temperature must be between 15C and 35C.')
        return value

    def validate_preferred_light_level(self, value):
        if not (0 <= value <= 2000):
            raise serializers.ValidationError('Light level must be between 0 and 2000 lux.')
        return value


# =============================================================================
# SUBSCRIPTION SERIALIZER
# =============================================================================
class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    is_premium = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = (
            'id', 'plan', 'status', 'billing_cycle',
            'is_active', 'is_premium',
            'max_sessions_per_day', 'max_team_members',
            'analytics_retention_days',
            'ai_recommendations_enabled', 'advanced_analytics_enabled',
            'current_period_start', 'current_period_end',
        )
        read_only_fields = fields


# =============================================================================
# PROFILE SERIALIZER
# =============================================================================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            'id', 'role', 'email_verified', 'onboarding_completed',
            'timezone', 'avatar_url',
            'preferred_temperature', 'preferred_light_level', 'preferred_noise_level',
            'focus_duration_preference', 'break_duration_preference',
            'phone_sync_enabled', 'calendar_integration_enabled', 'browser_focus_mode_enabled',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'role', 'email_verified', 'created_at', 'updated_at')


# =============================================================================
# FOCUS SESSION SERIALIZERS
# =============================================================================
class FocusSessionStartSerializer(serializers.Serializer):
    """POST /sessions/start - Start a new focus session."""
    task_type = serializers.ChoiceField(
        choices=FocusSession.FOCUS_TASK_TYPES, default='deep_work',
        help_text='Type of work: deep_work, creative, analytical, learning, writing, coding'
    )
    label = serializers.CharField(max_length=200, required=False, default='')
    start_temperature = serializers.FloatField(help_text='Room temperature in Celsius')
    start_light_level = serializers.IntegerField(help_text='Light level in lux')
    start_noise_level = serializers.IntegerField(help_text='Noise level in dB')
    team_id = serializers.IntegerField(required=False, allow_null=True, default=None)

    def validate_start_temperature(self, value):
        if not (5.0 <= value <= 50.0):
            raise serializers.ValidationError('Temperature must be between 5C and 50C.')
        return value

    def validate_start_light_level(self, value):
        if not (0 <= value <= 100000):
            raise serializers.ValidationError('Light level must be between 0 and 100,000 lux.')
        return value

    def validate_start_noise_level(self, value):
        if not (0 <= value <= 200):
            raise serializers.ValidationError('Noise level must be between 0 and 200 dB.')
        return value

    def validate_team_id(self, value):
        if value is not None:
            if not Team.objects.filter(id=value).exists():
                raise serializers.ValidationError('Team not found.')
        return value


class FocusSessionEndSerializer(serializers.Serializer):
    """POST /sessions/end - End an active session."""
    session_id = serializers.IntegerField()
    focus_score = serializers.IntegerField(
        min_value=0, max_value=100, help_text='Self-reported focus score 0-100'
    )
    distractions_count = serializers.IntegerField(min_value=0, default=0)
    notes = serializers.CharField(max_length=2000, required=False, default='')


class FocusSessionSerializer(serializers.ModelSerializer):
    """Full session representation for history listings."""
    user = UserMiniSerializer(read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    distraction_events = serializers.SerializerMethodField()

    class Meta:
        model = FocusSession
        fields = (
            'id', 'user', 'team', 'task_type', 'label',
            'start_time', 'end_time', 'duration', 'duration_minutes',
            'is_completed', 'start_temperature',
            'start_light_level', 'start_noise_level', 'distractions_count',
            'focus_score', 'notes', 'distraction_events',
            'created_at', 'updated_at',
        )
        read_only_fields = fields

    def get_duration_minutes(self, obj):
        if obj.duration:
            return round(obj.duration.total_seconds() / 60, 1)
        return None

    def get_distraction_events(self, obj):
        events = obj.distraction_events.all()[:10]
        return DistractionEventSerializer(events, many=True).data


class DistractionEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistractionEvent
        fields = (
            'id', 'distraction_type', 'severity',
            'description', 'recovery_time_seconds', 'timestamp',
        )
        read_only_fields = ('id', 'timestamp')


# =============================================================================
# ENVIRONMENT SERIALIZERS
# =============================================================================
class EnvironmentLogCreateSerializer(serializers.Serializer):
    """POST /environment/log - Log environment reading."""
    temperature = serializers.FloatField(help_text='Room temperature in Celsius')
    light_level = serializers.IntegerField(help_text='Light level in lux')
    noise_level = serializers.IntegerField(help_text='Noise level in dB')
    hue_lights_status = serializers.CharField(required=False, default='')
    nest_thermostat_status = serializers.CharField(required=False, default='')
    smart_plugs_status = serializers.CharField(required=False, default='')

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


class EnvironmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnvironmentLog
        fields = (
            'id', 'timestamp', 'temperature', 'light_level', 'noise_level',
            'hue_lights_status', 'nest_thermostat_status', 'smart_plugs_status',
        )
        read_only_fields = fields


# =============================================================================
# AI SERIALIZERS
# =============================================================================
class EnvironmentOptimizeSerializer(serializers.Serializer):
    """POST /ai/optimize-environment - Request body."""
    current_temperature = serializers.FloatField()
    current_light_level = serializers.IntegerField()
    current_noise_level = serializers.IntegerField()
    task_type = serializers.ChoiceField(
        choices=FocusSession.FOCUS_TASK_TYPES, default='deep_work'
    )


# =============================================================================
# TEAM SERIALIZERS
# =============================================================================
class TeamCreateSerializer(serializers.Serializer):
    """POST /team/create"""
    name = serializers.CharField(max_length=100)
    slug = serializers.SlugField()

    def validate_slug(self, value):
        if Team.objects.filter(slug=value).exists():
            raise serializers.ValidationError('A team with this slug already exists.')
        return value


class TeamInviteSerializer(serializers.Serializer):
    """POST /team/invite"""
    team_id = serializers.IntegerField()
    username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(
        choices=TeamMembership.ROLE_CHOICES, default='member'
    )

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError('User not found.')
        return value

    def validate_team_id(self, value):
        if not Team.objects.filter(id=value).exists():
            raise serializers.ValidationError('Team not found.')
        return value


class TeamSerializer(serializers.ModelSerializer):
    """Full team representation."""
    owner = UserMiniSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    workspace = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'name', 'slug', 'owner', 'members_count',
            'members', 'workspace', 'created_at',
        )
        read_only_fields = fields

    def get_members_count(self, obj):
        return obj.memberships.count()

    def get_members(self, obj):
        memberships = obj.memberships.select_related('user').all()
        return TeamMembershipSerializer(memberships, many=True).data

    def get_workspace(self, obj):
        try:
            return TeamWorkspaceSerializer(obj.workspace).data
        except TeamWorkspace.DoesNotExist:
            return None


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ('id', 'user', 'role', 'joined_at')
        read_only_fields = fields


class TeamWorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamWorkspace
        fields = (
            'id', 'daily_focus_goal_minutes', 'weekly_session_goal',
            'leaderboard_enabled', 'visibility',
        )
        read_only_fields = fields


# =============================================================================
# STREAK SERIALIZER
# =============================================================================
class UserStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStreak
        fields = (
            'current_streak_days', 'current_streak_start',
            'longest_streak_days', 'longest_streak_start', 'longest_streak_end',
            'last_active_date',
            'active_days_this_week', 'active_days_this_month',
            'total_active_days',
        )
        read_only_fields = fields


# =============================================================================
# PRODUCTIVITY METRIC SERIALIZER
# =============================================================================
class ProductivityMetricSerializer(serializers.ModelSerializer):
    total_focus_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = ProductivityMetric
        fields = (
            'id', 'date', 'total_focus_time', 'total_focus_time_minutes',
            'average_focus_score', 'distractions_count', 'tasks_completed',
            'session_count', 'completed_session_count',
            'session_completion_rate', 'optimal_temperature', 'optimal_light_level',
            'optimal_noise_level', 'top_distraction_type', 'avg_recovery_time_seconds',
        )
        read_only_fields = fields

    def get_total_focus_time_minutes(self, obj):
        if obj.total_focus_time:
            return round(obj.total_focus_time.total_seconds() / 60, 1)
        return None


# =============================================================================
# ACHIEVEMENT SERIALIZERS
# =============================================================================
class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = (
            'id', 'slug', 'name', 'description', 'category', 'rarity',
            'icon', 'points', 'criteria_type', 'criteria_value',
        )
        read_only_fields = fields


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('id', 'achievement', 'unlocked_at', 'notified')
        read_only_fields = fields