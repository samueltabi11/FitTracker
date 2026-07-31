from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Profile


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Profile is created by the post_save signal in signals.py once the User row exists
        user = User.objects.create_user(**validated_data)
        #Profile.objects.create(user=user) ---------------------> created dat bug
        return user


class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            'date_of_birth',
            'sex',
            'height_cm',
            'weight_kg',
            'activity_level',
            'primary_goal',
            'unit_preference',
        )