from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# =============================================================================
# SUBSCRIPTION & BILLING
# =============================================================================
class Subscription(models.Model):
    """SaaS subscription tiers with billing cycle tracking."""
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('trialing', 'Trialing'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
    ]
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='subscription'
    )
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    billing_cycle = models.CharField(
        max_length=10, choices=BILLING_CYCLE_CHOICES, default='monthly'
    )

    # Billing details
    stripe_customer_id = models.CharField(max_length=255, blank=True, default='')
    stripe_subscription_id = models.CharField(max_length=255, blank=True, default='')

    # Dates
    trial_start = models.DateTimeField(blank=True, null=True)
    trial_end = models.DateTimeField(blank=True, null=True)
    current_period_start = models.DateTimeField(blank=True, null=True)
    current_period_end = models.DateTimeField(blank=True, null=True)
    canceled_at = models.DateTimeField(blank=True, null=True)

    # Limits (overridable per-subscription)
    max_sessions_per_day = models.IntegerField(default=5)          # Free: 5, Pro: unlimited
    max_team_members = models.IntegerField(default=0)              # Free: 0, Pro: 10, Ent: unlimited
    max_environment_devices = models.IntegerField(default=2)       # Free: 2, Pro: 10, Ent: unlimited
    analytics_retention_days = models.IntegerField(default=30)     # Free: 30, Pro: 365, Ent: unlimited
    ai_recommendations_enabled = models.BooleanField(default=False)
    advanced_analytics_enabled = models.BooleanField(default=False)
    custom_soundscapes_enabled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['plan', 'status']),
            models.Index(fields=['current_period_end']),
            models.Index(fields=['stripe_customer_id']),
        ]

    def __str__(self):
        return self.user.username + ' - ' + self.plan + ' (' + self.status + ')'

    @property
    def is_active(self):
        return self.status in ('active', 'trialing')

    @property
    def is_premium(self):
        return self.plan in ('pro', 'enterprise') and self.is_active


# =============================================================================
# TEAM & WORKSPACE
# =============================================================================
class Team(models.Model):
    """Team model for multi-user collaboration."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='owned_teams'
    )
    members = models.ManyToManyField(
        User, through='TeamMembership', related_name='teams'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name


class TeamMembership(models.Model):
    """Through model for team membership with roles."""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'team')
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['user', 'team']),
            models.Index(fields=['team', 'role']),
        ]

    def __str__(self):
        return self.user.username + ' -> ' + self.team.name + ' (' + self.role + ')'


class TeamWorkspace(models.Model):
    """Shared workspace settings and goals for a team."""
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('team', 'Team Only'),
        ('public', 'Public'),
    ]

    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='workspace')

    # Workspace settings
    default_focus_duration = models.IntegerField(
        default=25, help_text='Default focus duration in minutes for this workspace'
    )
    default_break_duration = models.IntegerField(
        default=5, help_text='Default break duration in minutes'
    )
    daily_focus_goal_minutes = models.IntegerField(
        default=240, help_text='Team daily focus goal in minutes'
    )
    weekly_session_goal = models.IntegerField(
        default=20, help_text='Team weekly session target'
    )

    # Sharing preferences
    share_focus_scores = models.BooleanField(
        default=True, help_text='Share individual focus scores with team'
    )
    share_streaks = models.BooleanField(
        default=True, help_text='Share streak data with team'
    )
    leaderboard_enabled = models.BooleanField(
        default=True, help_text='Enable team leaderboard'
    )
    visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default='team'
    )

    # Notification settings
    daily_standup_enabled = models.BooleanField(default=False)
    standup_time = models.TimeField(blank=True, null=True)
    weekly_report_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['team']),
        ]

    def __str__(self):
        return self.team.name + ' Workspace'


# =============================================================================
# USER PROFILE
# =============================================================================
class UserProfile(models.Model):
    """Extended user profile with focus preferences and role."""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('team_lead', 'Team Lead'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    # Focus preferences
    preferred_temperature = models.FloatField(
        default=22.0, help_text='Preferred room temperature in Celsius'
    )
    preferred_light_level = models.IntegerField(
        default=300, help_text='Preferred light level in lux'
    )
    preferred_noise_level = models.IntegerField(
        default=40, help_text='Preferred noise level in dB'
    )
    focus_duration_preference = models.IntegerField(
        default=25, help_text='Preferred focus session duration in minutes'
    )
    break_duration_preference = models.IntegerField(
        default=5, help_text='Preferred break duration in minutes'
    )

    # Connected devices
    philips_hue_bridge_ip = models.CharField(max_length=15, blank=True, default='')
    nest_token = models.CharField(max_length=255, blank=True, default='')
    smart_plug_ids = models.TextField(blank=True, default='')

    # Notification preferences
    phone_sync_enabled = models.BooleanField(default=False)
    calendar_integration_enabled = models.BooleanField(default=False)
    browser_focus_mode_enabled = models.BooleanField(default=True)

    # Account status
    email_verified = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    timezone = models.CharField(max_length=50, default='UTC')
    avatar_url = models.URLField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return self.user.username + "'s Profile (" + self.role + ')'


# =============================================================================
# FOCUS SESSIONS & DISTRACTIONS
# =============================================================================
class FocusSession(models.Model):
    """Individual focus work session with environment and metric tracking."""
    FOCUS_TASK_TYPES = [
        ('deep_work', 'Deep Work'),
        ('creative', 'Creative Work'),
        ('analytical', 'Analytical Work'),
        ('learning', 'Learning'),
        ('writing', 'Writing'),
        ('coding', 'Coding'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='focus_sessions')
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='team_sessions',
        help_text='Team context for this session (if collaborative)'
    )
    task_type = models.CharField(max_length=20, choices=FOCUS_TASK_TYPES, default='deep_work')
    label = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Optional label like "Sprint planning" or "Chapter 3 review"'
    )
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    is_completed = models.BooleanField(default=False, db_index=True)

    # Environment data at session start
    start_temperature = models.FloatField(
        help_text='Room temperature at session start in Celsius'
    )
    start_light_level = models.IntegerField(
        help_text='Light level at session start in lux'
    )
    start_noise_level = models.IntegerField(
        help_text='Noise level at session start in dB'
    )

    # Session metrics
    distractions_count = models.IntegerField(default=0)
    focus_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Focus score from 0-100',
        db_index=True,
    )

    # Session notes (post-session reflection)
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            # Primary query: user's sessions sorted by time
            models.Index(fields=['user', '-start_time'], name='idx_session_user_time'),
            # Filter by type
            models.Index(fields=['user', 'task_type'], name='idx_session_user_type'),
            # Date-based analytics queries
            models.Index(fields=['user', 'is_completed', '-start_time'], name='idx_session_completed'),
            # Team sessions
            models.Index(fields=['team', '-start_time'], name='idx_session_team_time'),
            # Score-based leaderboard queries
            models.Index(fields=['user', '-focus_score'], name='idx_session_user_score'),
            # Global timestamp for partitioning-like queries
            models.Index(fields=['-start_time'], name='idx_session_start_global'),
            # created_at for admin/reporting
            models.Index(fields=['-created_at'], name='idx_session_created'),
        ]

    def __str__(self):
        return self.user.username + ' - ' + self.task_type + ' (' + str(self.start_time.date()) + ')'


class DistractionEvent(models.Model):
    """Individual distraction events within a focus session."""
    DISTRACTION_TYPES = [
        ('phone', 'Phone Notification'),
        ('email', 'Email'),
        ('chat', 'Chat Message'),
        ('social_media', 'Social Media'),
        ('meeting', 'Unplanned Meeting'),
        ('colleague', 'Colleague Interruption'),
        ('noise', 'Environmental Noise'),
        ('internal', 'Internal (mind wandering)'),
        ('break', 'Unplanned Break'),
        ('other', 'Other'),
    ]
    SEVERITY_CHOICES = [
        (1, 'Minor - recovered in <30s'),
        (2, 'Moderate - recovered in 1-5min'),
        (3, 'Major - recovered in 5-15min'),
        (4, 'Severe - session significantly impacted'),
        (5, 'Critical - session abandoned'),
    ]

    session = models.ForeignKey(
        FocusSession, on_delete=models.CASCADE, related_name='distraction_events'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='distraction_events'
    )
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    distraction_type = models.CharField(
        max_length=20, choices=DISTRACTION_TYPES, default='other', db_index=True
    )
    severity = models.IntegerField(
        choices=SEVERITY_CHOICES, default=2,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    description = models.CharField(max_length=300, blank=True, default='')
    recovery_time_seconds = models.IntegerField(
        default=0, help_text='Time taken to refocus in seconds'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['session', '-timestamp'], name='idx_distraction_session'),
            models.Index(fields=['user', '-timestamp'], name='idx_distraction_user_time'),
            models.Index(fields=['user', 'distraction_type'], name='idx_distraction_user_type'),
            models.Index(fields=['-created_at'], name='idx_distraction_created'),
        ]

    def __str__(self):
        return self.distraction_type + ' @ ' + str(self.timestamp.strftime('%H:%M'))


# =============================================================================
# ENVIRONMENT LOGS (time-series, high-volume)
# =============================================================================
class EnvironmentLog(models.Model):
    """
    Time-series log of workspace environment readings.

    PARTITIONING STRATEGY (for 100k+ users):
    - SQLite: Use date-based table rotation via management command
    - PostgreSQL: RANGE partition by timestamp (monthly)
    - Archive logs older than analytics_retention_days to cold storage
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='environment_logs')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    temperature = models.FloatField(help_text='Room temperature in Celsius')
    light_level = models.IntegerField(help_text='Light level in lux')
    noise_level = models.IntegerField(help_text='Noise level in dB')

    # Device statuses stored as JSON text
    hue_lights_status = models.TextField(blank=True, default='')
    nest_thermostat_status = models.TextField(blank=True, default='')
    smart_plugs_status = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            # Primary query pattern: latest readings for a user
            models.Index(fields=['user', '-timestamp'], name='idx_envlog_user_time'),
            # Date-range queries for analytics
            models.Index(fields=['-timestamp'], name='idx_envlog_timestamp'),
            # Composite for correlated environment analysis
            models.Index(
                fields=['user', 'temperature', 'light_level', 'noise_level'],
                name='idx_envlog_user_env',
            ),
        ]

    def __str__(self):
        return 'Env log - ' + self.user.username + ' at ' + str(self.timestamp)


# =============================================================================
# PRODUCTIVITY METRICS (daily aggregates)
# =============================================================================
class ProductivityMetric(models.Model):
    """Aggregated daily productivity metrics per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='productivity_metrics')
    date = models.DateField(db_index=True)

    # Daily metrics
    total_focus_time = models.DurationField(help_text='Total focus time for the day')
    average_focus_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Average focus score from 0-100'
    )
    distractions_count = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    session_count = models.IntegerField(default=0)
    completed_session_count = models.IntegerField(default=0)
    session_completion_rate = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Completion rate (0.0 to 1.0)'
    )

    # Environmental correlations
    optimal_temperature = models.FloatField(help_text='Most productive temperature in Celsius')
    optimal_light_level = models.IntegerField(help_text='Most productive light level in lux')
    optimal_noise_level = models.IntegerField(help_text='Most productive noise level in dB')

    # Distraction analysis
    top_distraction_type = models.CharField(max_length=20, blank=True, default='')
    avg_recovery_time_seconds = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']
        indexes = [
            # Primary: user metrics over time
            models.Index(fields=['user', '-date'], name='idx_metric_user_date'),
            # Leaderboard / reporting
            models.Index(fields=['-date', '-average_focus_score'], name='idx_metric_date_score'),
            # created_at for admin
            models.Index(fields=['-created_at'], name='idx_metric_created'),
        ]

    def __str__(self):
        return 'Metrics - ' + self.user.username + ' on ' + str(self.date)


# =============================================================================
# ACHIEVEMENTS & GAMIFICATION
# =============================================================================
class Achievement(models.Model):
    """
    Achievement definitions (badges and milestones).
    These are global records - each row is an achievement type.
    """
    CATEGORY_CHOICES = [
        ('streak', 'Streak'),
        ('sessions', 'Sessions'),
        ('focus_score', 'Focus Score'),
        ('time', 'Total Time'),
        ('environment', 'Environment'),
        ('team', 'Team'),
        ('special', 'Special'),
    ]
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    icon = models.CharField(max_length=50, default='trophy', help_text='Emoji or icon name')
    points = models.IntegerField(default=10)

    # Unlock criteria (JSON-like config)
    criteria_type = models.CharField(
        max_length=50, help_text='e.g. streak_days, total_sessions, avg_score'
    )
    criteria_value = models.IntegerField(
        help_text='Threshold value to unlock (e.g. 7 for "7-day streak")'
    )

    # Subscription requirements
    requires_premium = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'criteria_value']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.icon + ' ' + self.name + ' (' + self.rarity + ')'


class UserAchievement(models.Model):
    """Tracks which achievements each user has unlocked."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_unlocks')
    unlocked_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']
        indexes = [
            models.Index(fields=['user', '-unlocked_at'], name='idx_userachieve_user_time'),
            models.Index(fields=['achievement'], name='idx_userachieve_achievement'),
        ]

    def __str__(self):
        return self.user.username + ' unlocked ' + self.achievement.name


# =============================================================================
# STREAKS
# =============================================================================
class UserStreak(models.Model):
    """
    Tracks user focus streaks - consecutive days with at least one completed session.
    One record per user, updated daily.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')

    # Current streak
    current_streak_days = models.IntegerField(default=0, db_index=True)
    current_streak_start = models.DateField(blank=True, null=True)

    # Best ever streak
    longest_streak_days = models.IntegerField(default=0)
    longest_streak_start = models.DateField(blank=True, null=True)
    longest_streak_end = models.DateField(blank=True, null=True)

    # Last activity tracking
    last_active_date = models.DateField(blank=True, null=True, db_index=True)

    # Weekly/monthly consistency
    active_days_this_week = models.IntegerField(default=0)
    active_days_this_month = models.IntegerField(default=0)

    # Total stats
    total_active_days = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['-current_streak_days'], name='idx_streak_current'),
            models.Index(fields=['-longest_streak_days'], name='idx_streak_longest'),
            models.Index(fields=['last_active_date'], name='idx_streak_last_active'),
        ]

    def __str__(self):
        return self.user.username + ' - ' + str(self.current_streak_days) + ' day streak'

    def update_streak(self, activity_date=None):
        """Update streak based on today's activity. Call after session completion."""
        today = activity_date or timezone.now().date()

        if self.last_active_date == today:
            return  # Already updated today

        from datetime import timedelta
        yesterday = today - timedelta(days=1)

        if self.last_active_date == yesterday:
            # Continue streak
            self.current_streak_days += 1
        elif self.last_active_date is None or self.last_active_date < yesterday:
            # Streak broken - save old if it was the longest
            if self.current_streak_days > self.longest_streak_days:
                self.longest_streak_days = self.current_streak_days
                self.longest_streak_start = self.current_streak_start
                self.longest_streak_end = self.last_active_date
            # Start new streak
            self.current_streak_days = 1
            self.current_streak_start = today

        self.last_active_date = today
        self.total_active_days += 1

        # Update weekly/monthly (simplified - reset logic in Celery tasks)
        self.active_days_this_week += 1
        self.active_days_this_month += 1

        self.save()