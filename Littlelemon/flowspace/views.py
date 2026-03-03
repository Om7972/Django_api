from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import UserProfile, FocusSession, EnvironmentLog, ProductivityMetric
from .serializers import UserProfileSerializer, FocusSessionSerializer, EnvironmentLogSerializer, ProductivityMetricSerializer

# UserProfile Views
class UserProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

# FocusSession Views
class FocusSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user).order_by('-start_time')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FocusSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_focus_session(request):
    """Start a new focus session"""
    serializer = FocusSessionSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user, start_time=timezone.now())
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_focus_session(request, session_id):
    """End an existing focus session"""
    session = get_object_or_404(FocusSession, id=session_id, user=request.user)
    if session.end_time:
        return Response({"error": "Session already ended"}, status=status.HTTP_400_BAD_REQUEST)
    
    session.end_time = timezone.now()
    session.duration = session.end_time - session.start_time
    session.is_completed = True
    session.save()
    
    serializer = FocusSessionSerializer(session)
    return Response(serializer.data)

# EnvironmentLog Views
class EnvironmentLogListCreateView(generics.ListCreateAPIView):
    serializer_class = EnvironmentLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EnvironmentLog.objects.filter(user=self.request.user).order_by('-timestamp')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EnvironmentLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnvironmentLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EnvironmentLog.objects.filter(user=self.request.user)

# ProductivityMetric Views
class ProductivityMetricListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductivityMetricSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductivityMetric.objects.filter(user=self.request.user).order_by('-date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductivityMetricDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductivityMetricSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductivityMetric.objects.filter(user=self.request.user)

# Dashboard data endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """Get dashboard data for the authenticated user"""
    # Get latest environment data
    latest_env = EnvironmentLog.objects.filter(user=request.user).order_by('-timestamp').first()
    
    # Get today's focus session data
    today = timezone.now().date()
    today_sessions = FocusSession.objects.filter(
        user=request.user, 
        start_time__date=today
    )
    
    total_focus_time = sum(
        [session.duration.total_seconds() if session.duration else 0 for session in today_sessions],
        0
    )
    
    completed_sessions = today_sessions.filter(is_completed=True).count()
    total_sessions = today_sessions.count()
    completion_rate = completed_sessions / total_sessions if total_sessions > 0 else 0
    
    # Get latest productivity metrics
    latest_metric = ProductivityMetric.objects.filter(user=request.user, date=today).first()
    
    data = {
        'environment_data': EnvironmentLogSerializer(latest_env).data if latest_env else None,
        'focus_stats': {
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'completion_rate': completion_rate,
            'total_focus_time': total_focus_time,
        },
        'productivity_metric': ProductivityMetricSerializer(latest_metric).data if latest_metric else None,
    }
    
    return Response(data)