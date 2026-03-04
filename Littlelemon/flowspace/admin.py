from django.contrib import admin
from .models import (
    Team, TeamMembership, UserProfile,
    FocusSession, EnvironmentLog, ProductivityMetric,
)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'slug', 'owner__username')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'team', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('user__username', 'team__name')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'email_verified', 'preferred_temperature', 'created_at')
    list_filter = ('role', 'email_verified')
    search_fields = ('user__username', 'user__email')


@admin.register(FocusSession)
class FocusSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'task_type', 'start_time', 'is_completed', 'focus_score')
    list_filter = ('task_type', 'is_completed', 'start_time')
    search_fields = ('user__username',)
    date_hierarchy = 'start_time'


@admin.register(EnvironmentLog)
class EnvironmentLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'timestamp', 'temperature', 'light_level', 'noise_level')
    list_filter = ('timestamp',)
    search_fields = ('user__username',)
    date_hierarchy = 'timestamp'


@admin.register(ProductivityMetric)
class ProductivityMetricAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'average_focus_score', 'tasks_completed', 'session_completion_rate')
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'
