"""
Celery configuration for the Littlelemon project.
"""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Littlelemon.settings')

app = Celery('Littlelemon')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


# =============================================================================
# Celery Beat Schedule - Periodic Tasks
# =============================================================================
app.conf.beat_schedule = {
    # Daily productivity summary - runs every day at 9:00 PM UTC
    'daily-productivity-summary': {
        'task': 'flowspace.tasks.send_daily_productivity_summary',
        'schedule': crontab(hour=21, minute=0),
        'options': {'expires': 3600},
    },

    # Weekly analytics email - runs every Monday at 8:00 AM UTC
    'weekly-analytics-email': {
        'task': 'flowspace.tasks.send_weekly_analytics_email',
        'schedule': crontab(hour=8, minute=0, day_of_week=1),
        'options': {'expires': 7200},
    },

    # Cache warmup - refresh dashboard caches every 5 minutes
    'cache-warmup-dashboard': {
        'task': 'flowspace.tasks.warmup_dashboard_caches',
        'schedule': crontab(minute='*/5'),
        'options': {'expires': 300},
    },
}
