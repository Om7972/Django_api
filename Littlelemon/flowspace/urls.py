from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # UserProfile URLs
    path('profiles/', views.UserProfileListCreateView.as_view(), name='profile-list-create'),
    path('profiles/<int:pk>/', views.UserProfileDetailView.as_view(), name='profile-detail'),
    
    # FocusSession URLs
    path('sessions/', views.FocusSessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', views.FocusSessionDetailView.as_view(), name='session-detail'),
    path('sessions/start/', views.start_focus_session, name='session-start'),
    path('sessions/<int:session_id>/end/', views.end_focus_session, name='session-end'),
    
    # EnvironmentLog URLs
    path('environment/', views.EnvironmentLogListCreateView.as_view(), name='environment-list-create'),
    path('environment/<int:pk>/', views.EnvironmentLogDetailView.as_view(), name='environment-detail'),
    
    # ProductivityMetric URLs
    path('metrics/', views.ProductivityMetricListCreateView.as_view(), name='metric-list-create'),
    path('metrics/<int:pk>/', views.ProductivityMetricDetailView.as_view(), name='metric-detail'),
    
    # Dashboard data
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
]