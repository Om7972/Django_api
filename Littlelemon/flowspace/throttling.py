"""
Custom throttling classes for the FlowSpace API.
"""

from rest_framework.throttling import UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Short-term burst rate limiting (e.g., 30/minute)."""
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """Sustained rate limiting for regular API usage."""
    scope = 'user'
