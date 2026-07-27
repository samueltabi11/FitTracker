from django.db import models
from django.contrib.auth.models import User


class ActivityLog(models.Model):
    SOURCE_CHOICES = [
        ("manual", "Manual"),
        ("apple_health", "Apple Health"),
        ("google_fit", "Google Fit"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activity_logs")
    date = models.DateField()
    steps = models.PositiveIntegerField(default=0)
    calories_burned = models.FloatField(null=True, blank=True)
    active_minutes = models.PositiveIntegerField(default=0)
    distance_km = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date", "source")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.source})"
