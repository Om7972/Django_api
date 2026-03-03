from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile, FocusSession, EnvironmentLog, ProductivityMetric
from datetime import datetime, timedelta

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
        
        # Create a user profile
        self.profile = UserProfile.objects.create(
            user=self.user,
            preferred_temperature=22.0,
            preferred_light_level=300,
            preferred_noise_level=40
        )
        
        # Create a focus session
        self.focus_session = FocusSession.objects.create(
            user=self.user,
            task_type='deep_work',
            start_time=datetime.now(),
            start_temperature=22.0,
            start_light_level=300,
            start_noise_level=40,
            focus_score=85
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
            date=datetime.now().date(),
            total_focus_time=timedelta(hours=2),
            average_focus_score=85,
            tasks_completed=5,
            session_completion_rate=0.8,
            optimal_temperature=22.0,
            optimal_light_level=300,
            optimal_noise_level=40
        )

    def test_get_user_profile(self):
        """Test retrieving user profile"""
        response = self.client.get('/api/flowspace/profiles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['preferred_temperature'], 22.0)

    def test_create_focus_session(self):
        """Test creating a focus session"""
        data = {
            'task_type': 'creative',
            'start_time': datetime.now().isoformat(),
            'start_temperature': 21.5,
            'start_light_level': 350,
            'start_noise_level': 38,
            'focus_score': 78
        }
        response = self.client.post('/api/flowspace/sessions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['task_type'], 'creative')
        self.assertEqual(response.data['focus_score'], 78)

    def test_get_environment_logs(self):
        """Test retrieving environment logs"""
        response = self.client.get('/api/flowspace/environment/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['temperature'], 22.0)

    def test_get_productivity_metrics(self):
        """Test retrieving productivity metrics"""
        response = self.client.get('/api/flowspace/metrics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['average_focus_score'], 85)

    def test_dashboard_data(self):
        """Test retrieving dashboard data"""
        response = self.client.get('/api/flowspace/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('environment_data', response.data)
        self.assertIn('focus_stats', response.data)
        self.assertIn('productivity_metric', response.data)