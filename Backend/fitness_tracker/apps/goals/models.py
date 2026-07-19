from django.db import models
from django.contrib.auth.models import User


class Goal(models.Model):
    GOAL_TYPE_CHOICES = [
        ("weekly_workouts", "Weekly Workouts"),
        ("daily_steps", "Daily Steps"),
        ("target_weight", "Target Weight"),
        ("weekly_calories", "Weekly Calories"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goals")
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    target_value = models.FloatField()
    current_value = models.FloatField(default=0)
    start_date = models.DateField(auto_now_add=True)
    target_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    achieved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.get_goal_type_display()}"
