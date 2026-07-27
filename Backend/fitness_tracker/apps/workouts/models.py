from django.db import models
from django.contrib.auth.models import User


class Exercise(models.Model):
    CATEGORY_CHOICES = [
        ("strength", "Strength"),
        ("cardio", "Cardio"),
        ("flexibility", "Flexibility"),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    equipment = models.CharField(max_length=100, blank=True)
    is_custom = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name


class Workout(models.Model):
    WORKOUT_TYPE_CHOICES = [
        ("strength", "Strength"),
        ("cardio", "Cardio"),
        ("custom", "Custom"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workouts")
    name = models.CharField(max_length=100, blank=True)
    workout_type = models.CharField(max_length=20, choices=WORKOUT_TYPE_CHOICES)
    date = models.DateField()
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or 'Workout'} - {self.date}"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.workout} - {self.exercise}"


class WorkoutSet(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name="sets")
    set_number = models.PositiveIntegerField()
    reps = models.PositiveIntegerField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ["set_number"]

    def __str__(self):
        return f"Set {self.set_number} for {self.workout_exercise}"
