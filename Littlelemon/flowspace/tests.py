from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile, FocusSession, EnvironmentLog, ProductivityMetric, Subscription, UserStreak
from datetime import datetime, timedelta
from django.utils import timezone

class FlowSpaceAPITestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Create API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Create user models (since register flow normally handles this, we do it manually for tests)
        self.profile = UserProfile.objects.create(
            user=self.user,
            preferred_temperature=22.0,
            preferred_light_level=300,
            preferred_noise_level=40
        )
        self.subscription = Subscription.objects.create(
            user=self.user,
            plan='free',
            status='active'
        )
        self.streak = UserStreak.objects.create(user=self.user)
        
        # Create a focus session
        start_time = timezone.now() - timedelta(hours=1)
        end_time = timezone.now()
        self.focus_session = FocusSession.objects.create(
            user=self.user,
            task_type='deep_work',
            start_time=start_time,
            end_time=end_time,
            duration=end_time - start_time,
            start_temperature=22.0,
            start_light_level=300,
            start_noise_level=40,
            focus_score=85,
            is_completed=True
        )
        
        # Create an environment log
        self.environment_log = EnvironmentLog.objects.create(
            user=self.user,
            temperature=22.0,
            light_level=300,
            noise_level=40
        )
        
        # Create a productivity metric
        self.productivity_metric = ProductivityMetric.objects.create(
            user=self.user,
            date=timezone.now().date(),
            total_focus_time=timedelta(hours=2),
            average_focus_score=85,
            tasks_completed=5,
            session_completion_rate=0.8,
            optimal_temperature=22.0,
            optimal_light_level=300,
            optimal_noise_level=40
        )

    def test_get_user_me(self):
        """Test retrieving current user profile"""
        response = self.client.get('/api/v1/users/me')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['profile']['preferred_temperature'], 22.0)

    def test_start_focus_session(self):
        """Test starting a focus session"""
        data = {
            'task_type': 'creative',
            'start_temperature': 21.5,
            'start_light_level': 350,
            'start_noise_level': 38,
            'focus_score': 0
        }
        response = self.client.post('/api/v1/sessions/start', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['task_type'], 'creative')
        self.assertFalse(response.data['is_completed'])

    def test_get_environment_history(self):
        """Test retrieving environment history"""
        response = self.client.get('/api/v1/environment/history')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['temperature'], 22.0)

    def test_session_analytics(self):
        """Test retrieving session analytics"""
        response = self.client.get('/api/v1/sessions/analytics')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('daily_breakdown', response.data)
        self.assertEqual(response.data['summary']['total_sessions'], 1)