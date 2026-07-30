from rest_framework import serializers


class WeightTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    weight = serializers.FloatField()


class WorkoutFrequencySerializer(serializers.Serializer):
    week_start = serializers.DateField()
    workout_count = serializers.IntegerField()


class PRSerializer(serializers.Serializer):
    exercise_name = serializers.CharField()
    max_weight = serializers.FloatField()
    date = serializers.DateField()

class WeightProgressionSerializer(serializers.Serializer):
    date = serializers.DateField()
    weight_kg = serializers.FloatField()

class ComparisonSerializer(serializers.Serializer):
    period = serializers.CharField()
    workouts = serializers.IntegerField()
    steps = serializers.IntegerField()
    calories = serializers.FloatField()
