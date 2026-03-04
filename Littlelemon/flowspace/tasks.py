"""
Celery background tasks for the FlowSpace app.
Includes daily productivity summaries, weekly analytics emails, and cache warmup.
"""

import logging
from datetime import timedelta
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Avg, Sum, Count

logger = logging.getLogger('flowspace')


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_daily_productivity_summary(self):
    """
    Send daily productivity summary to all active users.
    Runs every day at 9 PM UTC via Celery Beat.
    """
    today = timezone.now().date()
    users = User.objects.filter(is_active=True).select_related('profile')
    sent_count = 0

    for user in users:
        try:
            from .models import FocusSession

            sessions = FocusSession.objects.filter(
                user=user, start_time__date=today
            )
            if not sessions.exists():
                continue

            total = sessions.count()
            completed = sessions.filter(is_completed=True).count()
            avg_score = sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0
            total_time = sum(
                (s.duration.total_seconds() / 60 if s.duration else 0 for s in sessions), 0
            )

            date_str = today.strftime("%B %d, %Y")
            name = user.first_name or user.username
            subject = '🎯 Your FlowSpace Daily Summary - ' + date_str
            lines = [
                'Hi ' + name + ',',
                '',
                'Here is your productivity summary for today:',
                '',
                '📊 Sessions: ' + str(completed) + '/' + str(total) + ' completed',
                '🎯 Avg Focus Score: ' + str(round(avg_score)) + '/100',
                '⏱️ Total Focus Time: ' + str(round(total_time)) + ' minutes',
                '',
                'Keep up the great work!',
                '— FlowSpace AI',
            ]
            message = '\n'.join(lines)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            sent_count += 1

        except Exception as exc:
            logger.error('Failed to send daily summary to user %s: %s', user.username, exc)

    logger.info('Daily productivity summary sent to %d users', sent_count)
    return 'Sent to ' + str(sent_count) + ' users'


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def send_weekly_analytics_email(self):
    """
    Send weekly analytics email with trends and insights.
    Runs every Monday at 8 AM UTC via Celery Beat.
    """
    today = timezone.now().date()
    week_start = today - timedelta(days=7)
    users = User.objects.filter(is_active=True)
    sent_count = 0

    for user in users:
        try:
            from .models import FocusSession
            from django.db.models.functions import TruncDate

            sessions = FocusSession.objects.filter(
                user=user,
                start_time__date__gte=week_start,
                start_time__date__lt=today,
            )
            if not sessions.exists():
                continue

            total = sessions.count()
            completed = sessions.filter(is_completed=True).count()
            avg_score = sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0

            # Get best day
            best_day = (
                sessions.annotate(day=TruncDate('start_time'))
                .values('day')
                .annotate(score=Avg('focus_score'))
                .order_by('-score')
                .first()
            )

            best_day_str = best_day['day'].strftime('%A') if best_day else 'N/A'

            name = user.first_name or user.username
            week_str = week_start.strftime("%B %d")
            subject = '📈 Your FlowSpace Weekly Report - Week of ' + week_str
            lines = [
                'Hi ' + name + ',',
                '',
                'Here is your weekly productivity report:',
                '',
                '📊 Total Sessions: ' + str(total),
                '✅ Completed: ' + str(completed),
                '🎯 Avg Focus Score: ' + str(round(avg_score)) + '/100',
                '⭐ Best Day: ' + best_day_str,
                '',
                'See your full analytics dashboard for more insights.',
                '— FlowSpace AI',
            ]
            message = '\n'.join(lines)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            sent_count += 1

        except Exception as exc:
            logger.error('Failed to send weekly analytics to user %s: %s', user.username, exc)

    logger.info('Weekly analytics email sent to %d users', sent_count)
    return 'Sent to ' + str(sent_count) + ' users'


@shared_task
def warmup_dashboard_caches():
    """
    Pre-warm dashboard caches for active users.
    Runs every 5 minutes via Celery Beat.
    """
    from .models import FocusSession, EnvironmentLog, ProductivityMetric
    from .cache import set_dashboard_cache, set_focus_score_cache
    from .serializers import EnvironmentLogSerializer, ProductivityMetricSerializer

    today = timezone.now().date()

    # Only warm caches for users with recent activity (last 24 hours)
    recent = timezone.now() - timedelta(hours=24)
    active_user_ids = (
        FocusSession.objects.filter(start_time__gte=recent)
        .values_list('user_id', flat=True)
        .distinct()
    )

    warmed = 0
    for user_id in active_user_ids:
        try:
            latest_env = EnvironmentLog.objects.filter(user_id=user_id).order_by('-timestamp').first()
            today_sessions = FocusSession.objects.filter(user_id=user_id, start_time__date=today)
            total = today_sessions.count()
            completed = today_sessions.filter(is_completed=True).count()

            total_focus_time = sum(
                (s.duration.total_seconds() if s.duration else 0 for s in today_sessions), 0
            )
            avg_score = today_sessions.aggregate(avg=Avg('focus_score'))['avg'] or 0

            latest_metric = ProductivityMetric.objects.filter(user_id=user_id, date=today).first()

            data = {
                'environment': EnvironmentLogSerializer(latest_env).data if latest_env else None,
                'focus_stats': {
                    'total_sessions': total,
                    'completed_sessions': completed,
                    'completion_rate': round(completed / total, 2) if total > 0 else 0,
                    'total_focus_time_seconds': total_focus_time,
                    'avg_focus_score': round(avg_score, 1),
                },
                'productivity': ProductivityMetricSerializer(latest_metric).data if latest_metric else None,
                'cached_at': timezone.now().isoformat(),
            }

            set_dashboard_cache(user_id, data)
            set_focus_score_cache(user_id, avg_score)
            warmed += 1

        except Exception as exc:
            logger.error('Failed to warm cache for user %s: %s', user_id, exc)

    logger.info('Dashboard caches warmed for %d users', warmed)
    return 'Warmed ' + str(warmed) + ' caches'
