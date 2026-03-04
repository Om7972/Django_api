"""
Custom pagination classes for the FlowSpace API.
"""

from rest_framework.pagination import PageNumberPagination, CursorPagination


class StandardPagination(PageNumberPagination):
    """Standard pagination with configurable page size."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SmallPagination(PageNumberPagination):
    """Smaller page size for lightweight listings."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class TimeSeriesPagination(CursorPagination):
    """Cursor-based pagination for time-series data (environment logs)."""
    page_size = 50
    ordering = '-timestamp'
    cursor_query_param = 'cursor'
