from rest_framework import serializers
from .models import Goal


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user', 'current_value', 'start_date', 'achieved')
    
    def get_progress_percentage(self, obj):
        # Safely compute progress as a percentage, handling None/0 targets
        try:
            target = float(obj.target_value) if obj.target_value is not None else 0.0
            current = float(obj.current_value) if obj.current_value is not None else 0.0
        except (TypeError, ValueError):
            return 0.0

        if target <= 0:
            return 0.0

        percent = (current / target) * 100.0
        
        # Clamp to [0, 100] and round to two decimals
        percent = max(0.0, min(100.0, percent))
        return round(percent, 2)