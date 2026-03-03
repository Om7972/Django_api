from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, FocusSession, EnvironmentLog, ProductivityMetric

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class FocusSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FocusSession
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class EnvironmentLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EnvironmentLog
        fields = '__all__'
        read_only_fields = ('user', 'timestamp')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProductivityMetricSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProductivityMetric
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)