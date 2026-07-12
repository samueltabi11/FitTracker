from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return get_user_model().objects.create_user(**validated_data)
    


class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'