from rest_framework import serializers
from .models import Goal


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user', 'current_value', 'start_date', 'achieved')
    
    def get_progress_percentage(self, obj):
        if obj.target_value == 0:
            return 0
        return min(100, (obj.current_value / obj.target_value) * 100)
