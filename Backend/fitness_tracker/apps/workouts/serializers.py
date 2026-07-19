from rest_framework import serializers
from .models import Exercise, Workout, WorkoutExercise, WorkoutSet


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'
        read_only_fields = ('is_custom', 'created_by')


class WorkoutSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSet
        fields = '__all__'


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True)
    
    class Meta:
        model = WorkoutExercise
        fields = '__all__'


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True)
    
    class Meta:
        model = Workout
        fields = '__all__'
        read_only_fields = ('user',)
    
    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises')
        workout = Workout.objects.create(**validated_data)
        
        for exercise_data in exercises_data:
            sets_data = exercise_data.pop('sets')
            workout_exercise = WorkoutExercise.objects.create(workout=workout, **exercise_data)
            
            for set_data in sets_data:
                WorkoutSet.objects.create(workout_exercise=workout_exercise, **set_data)
        
        return workout
    
    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if exercises_data is not None:
            instance.exercises.all().delete()
            for exercise_data in exercises_data:
                sets_data = exercise_data.pop('sets')
                workout_exercise = WorkoutExercise.objects.create(workout=instance, **exercise_data)
                
                for set_data in sets_data:
                    WorkoutSet.objects.create(workout_exercise=workout_exercise, **set_data)
        
        return instance


class WorkoutListSerializer(serializers.ModelSerializer):
    exercise_count = serializers.IntegerField(source='exercises.count', read_only=True)
    
    class Meta:
        model = Workout
        fields = ('id', 'name', 'date', 'duration_minutes', 'exercise_count')
