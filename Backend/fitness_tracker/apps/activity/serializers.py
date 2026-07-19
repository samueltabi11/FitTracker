from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class ActivitySummarySerializer(serializers.Serializer):
    total_steps = serializers.IntegerField()
    total_calories = serializers.FloatField()
    total_active_minutes = serializers.IntegerField()
    total_distance = serializers.FloatField()
    average_steps_per_day = serializers.FloatField()
