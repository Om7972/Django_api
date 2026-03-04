from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


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

    def __str__(self):
        return self.user.username + ' -> ' + self.team.name + ' (' + self.role + ')'


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

    # Email verification
    email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username + "'s Profile (" + self.role + ')'


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
    task_type = models.CharField(max_length=20, choices=FOCUS_TASK_TYPES, default='deep_work')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

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
        help_text='Focus score from 0-100'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', '-start_time']),
            models.Index(fields=['user', 'task_type']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return self.user.username + ' - ' + self.task_type + ' (' + str(self.start_time.date()) + ')'


class EnvironmentLog(models.Model):
    """Time-series log of workspace environment readings."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='environment_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField(help_text='Room temperature in Celsius')
    light_level = models.IntegerField(help_text='Light level in lux')
    noise_level = models.IntegerField(help_text='Noise level in dB')

    # Device statuses (JSON-like text)
    hue_lights_status = models.TextField(blank=True, default='')
    nest_thermostat_status = models.TextField(blank=True, default='')
    smart_plugs_status = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return 'Env log - ' + self.user.username + ' at ' + str(self.timestamp)


class ProductivityMetric(models.Model):
    """Aggregated daily productivity metrics per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='productivity_metrics')
    date = models.DateField()

    # Daily metrics
    total_focus_time = models.DurationField(help_text='Total focus time for the day')
    average_focus_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Average focus score from 0-100'
    )
    distractions_count = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    session_completion_rate = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text='Completion rate (0.0 to 1.0)'
    )

    # Environmental correlations
    optimal_temperature = models.FloatField(help_text='Most productive temperature in Celsius')
    optimal_light_level = models.IntegerField(help_text='Most productive light level in lux')
    optimal_noise_level = models.IntegerField(help_text='Most productive noise level in dB')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', '-date']),
        ]

    def __str__(self):
        return 'Metrics - ' + self.user.username + ' on ' + str(self.date)