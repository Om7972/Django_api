from django.contrib import admin
from .models import (
    Subscription, Team, TeamMembership, TeamWorkspace,
    UserProfile, FocusSession, DistractionEvent,
    EnvironmentLog, ProductivityMetric,
    Achievement, UserAchievement, UserStreak,
)


# =============================================================================
# Subscription
# =============================================================================
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'billing_cycle', 'current_period_end', 'created_at')
    list_filter = ('plan', 'status', 'billing_cycle')
    search_fields = ('user__username', 'user__email', 'stripe_customer_id')
    readonly_fields = ('created_at', 'updated_at')


# =============================================================================
# Team & Workspace
# =============================================================================
@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'member_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'slug', 'owner__username')
    prepopulated_fields = {'slug': ('name',)}

    def member_count(self, obj):
        return obj.memberships.count()
    member_count.short_description = 'Members'


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'team', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('user__username', 'team__name')


@admin.register(TeamWorkspace)
class TeamWorkspaceAdmin(admin.ModelAdmin):
    list_display = (
        'team', 'daily_focus_goal_minutes', 'weekly_session_goal',
        'leaderboard_enabled', 'visibility'
    )
    list_filter = ('visibility', 'leaderboard_enabled')
    search_fields = ('team__name',)


# =============================================================================
# User Profile
# =============================================================================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'role', 'email_verified', 'onboarding_completed',
        'preferred_temperature', 'created_at'
    )
    list_filter = ('role', 'email_verified', 'onboarding_completed')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


# =============================================================================
# Focus Sessions & Distractions
# =============================================================================
class DistractionEventInline(admin.TabularInline):
    model = DistractionEvent
    extra = 0
    readonly_fields = ('timestamp', 'created_at')
    fields = ('distraction_type', 'severity', 'description', 'recovery_time_seconds', 'timestamp')


@admin.register(FocusSession)
class FocusSessionAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'task_type', 'label', 'start_time', 'is_completed',
        'focus_score', 'distractions_count'
    )
    list_filter = ('task_type', 'is_completed', 'start_time')
    search_fields = ('user__username', 'label')
    date_hierarchy = 'start_time'
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DistractionEventInline]


@admin.register(DistractionEvent)
class DistractionEventAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'session', 'distraction_type', 'severity',
        'recovery_time_seconds', 'timestamp'
    )
    list_filter = ('distraction_type', 'severity', 'timestamp')
    search_fields = ('user__username', 'description')
    date_hierarchy = 'timestamp'


# =============================================================================
# Environment & Metrics
# =============================================================================
@admin.register(EnvironmentLog)
class EnvironmentLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'temperature', 'light_level', 'noise_level')
    list_filter = ('timestamp',)
    search_fields = ('user__username',)
    date_hierarchy = 'timestamp'


@admin.register(ProductivityMetric)
class ProductivityMetricAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'date', 'average_focus_score', 'session_count',
        'tasks_completed', 'session_completion_rate'
    )
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'


# =============================================================================
# Achievements & Streaks
# =============================================================================
@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        'icon', 'name', 'category', 'rarity', 'points',
        'criteria_type', 'criteria_value', 'is_active'
    )
    list_filter = ('category', 'rarity', 'is_active', 'requires_premium')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at', 'notified')
    list_filter = ('notified', 'unlocked_at')
    search_fields = ('user__username', 'achievement__name')
    date_hierarchy = 'unlocked_at'


@admin.register(UserStreak)
class UserStreakAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'current_streak_days', 'longest_streak_days',
        'last_active_date', 'total_active_days'
    )
    list_filter = ('last_active_date',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)
