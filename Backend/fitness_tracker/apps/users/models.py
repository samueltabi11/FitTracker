from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth=models.DateField(blank=True, null=True)
    sex=models.CharField(max_length=10, choices=[("M","Male"), ("F","Female"), ("O","Other")])
    height_cm=models.FloatField(blank=True, null=True)
    weight_kg=models.FloatField(blank=True, null=True)
    activity_level = models.CharField(max_length=20, choices=[
        ("sedentary","Sedentary"), ("light","Light"),
        ("active","Active"), ("very_active","Very Active")
    ])
    primary_goal = models.CharField(max_length=20, choices=[
        ("lose_weight","Lose Weight"), ("maintain_weight","Maintain Weight"), ("build_muscle","Build Muscle"),
        ("endurance","Endurance"), ("general","General Fitness")
    ])
    unit_preference = models.CharField(max_length=10, choices=[("metric","Metric"), ("imperial","Imperial")], default="metric")
    onboarding_completed = models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)