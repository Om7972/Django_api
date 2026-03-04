"""
DRF FilterSets for the FlowSpace app.
"""

import django_filters
from .models import FocusSession, EnvironmentLog, ProductivityMetric


class FocusSessionFilter(django_filters.FilterSet):
    """Filter focus sessions by date range, task type, and completion status."""
    start_date = django_filters.DateFilter(field_name='start_time', lookup_expr='date__gte')
    end_date = django_filters.DateFilter(field_name='start_time', lookup_expr='date__lte')
    task_type = django_filters.ChoiceFilter(choices=FocusSession.FOCUS_TASK_TYPES)
    is_completed = django_filters.BooleanFilter()
    min_score = django_filters.NumberFilter(field_name='focus_score', lookup_expr='gte')
    max_score = django_filters.NumberFilter(field_name='focus_score', lookup_expr='lte')

    class Meta:
        model = FocusSession
        fields = ['task_type', 'is_completed', 'start_date', 'end_date', 'min_score', 'max_score']


class EnvironmentLogFilter(django_filters.FilterSet):
    """Filter environment logs by date range and metric thresholds."""
    start_date = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')
    min_temperature = django_filters.NumberFilter(field_name='temperature', lookup_expr='gte')
    max_temperature = django_filters.NumberFilter(field_name='temperature', lookup_expr='lte')

    class Meta:
        model = EnvironmentLog
        fields = ['start_date', 'end_date', 'min_temperature', 'max_temperature']


class ProductivityMetricFilter(django_filters.FilterSet):
    """Filter productivity metrics by date range."""
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    min_score = django_filters.NumberFilter(field_name='average_focus_score', lookup_expr='gte')

    class Meta:
        model = ProductivityMetric
        fields = ['start_date', 'end_date', 'min_score']
