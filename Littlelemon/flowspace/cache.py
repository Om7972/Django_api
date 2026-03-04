"""
Redis caching helpers for the FlowSpace app.
Provides cache wrappers for dashboard metrics and focus score computation.
"""

import logging
from functools import wraps
from django.core.cache import cache

logger = logging.getLogger('flowspace')

# Cache key templates
DASHBOARD_CACHE_KEY = 'flowspace:dashboard:{user_id}'
FOCUS_SCORE_CACHE_KEY = 'flowspace:focus_score:{user_id}'
WEEKLY_METRICS_CACHE_KEY = 'flowspace:weekly_metrics:{user_id}'

# Cache timeouts (seconds)
DASHBOARD_CACHE_TTL = 300       # 5 minutes
FOCUS_SCORE_CACHE_TTL = 120     # 2 minutes
WEEKLY_METRICS_CACHE_TTL = 600  # 10 minutes


def get_dashboard_cache(user_id):
    """Retrieve cached dashboard data for a user."""
    key = DASHBOARD_CACHE_KEY.format(user_id=user_id)
    data = cache.get(key)
    if data:
        logger.debug('Dashboard cache HIT for user %s', user_id)
    else:
        logger.debug('Dashboard cache MISS for user %s', user_id)
    return data


def set_dashboard_cache(user_id, data):
    """Store dashboard data in cache."""
    key = DASHBOARD_CACHE_KEY.format(user_id=user_id)
    cache.set(key, data, DASHBOARD_CACHE_TTL)
    logger.debug('Dashboard cache SET for user %s', user_id)


def invalidate_dashboard_cache(user_id):
    """Invalidate cached dashboard data when underlying data changes."""
    key = DASHBOARD_CACHE_KEY.format(user_id=user_id)
    cache.delete(key)
    logger.debug('Dashboard cache INVALIDATED for user %s', user_id)


def get_focus_score_cache(user_id):
    """Retrieve cached focus score for a user."""
    key = FOCUS_SCORE_CACHE_KEY.format(user_id=user_id)
    return cache.get(key)


def set_focus_score_cache(user_id, score):
    """Cache computed focus score."""
    key = FOCUS_SCORE_CACHE_KEY.format(user_id=user_id)
    cache.set(key, score, FOCUS_SCORE_CACHE_TTL)


def invalidate_focus_score_cache(user_id):
    """Invalidate focus score cache."""
    key = FOCUS_SCORE_CACHE_KEY.format(user_id=user_id)
    cache.delete(key)


def cache_response(key_template, timeout=300):
    """
    Decorator to cache the return value of a function.

    Usage:
        @cache_response('mykey:{user_id}', timeout=60)
        def my_view(request, user_id):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from kwargs
            cache_key = key_template.format(**kwargs)
            cached = cache.get(cache_key)
            if cached is not None:
                return cached
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator
