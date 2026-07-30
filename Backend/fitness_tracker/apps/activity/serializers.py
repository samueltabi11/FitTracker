from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    # user is read-only with no default, so DRF can't build a working
    # UniqueTogetherValidator for the model's (user, date, source) constraint -
    # it silently skips it, letting duplicates reach the DB and raise an
    # unhandled IntegrityError. Check it here instead so it's a clean 400.
    def validate(self, data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return data

        date = data.get('date', getattr(self.instance, 'date', None))
        source = data.get('source', getattr(self.instance, 'source', None))

        conflict = ActivityLog.objects.filter(user=request.user, date=date, source=source)
        if self.instance:
            conflict = conflict.exclude(pk=self.instance.pk)

        if conflict.exists():
            raise serializers.ValidationError("You've already logged activity for this date.")

        return data


class ActivitySummarySerializer(serializers.Serializer):
    total_steps = serializers.IntegerField()
    total_calories = serializers.FloatField()
    total_active_minutes = serializers.IntegerField()
    total_distance = serializers.FloatField()
    average_steps_per_day = serializers.FloatField()
