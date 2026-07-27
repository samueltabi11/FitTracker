from rest_framework import viewsets, generics, permissions
from django.utils import timezone
from django.db.models import Sum
from apps.workouts.models import Workout
from apps.activity.models import ActivityLog
from .models import Goal
from .serializers import GoalSerializer


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalProgressView(generics.RetrieveAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
    def get_object(self):
        goal = super().get_object()
        
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())
        
        if goal.goal_type == 'weekly_workouts':
            count = Workout.objects.filter(
                user=goal.user,
                date__gte=week_start,
                date__lte=today
            ).count()
            goal.current_value = count
        elif goal.goal_type == 'daily_steps':
            today_log = ActivityLog.objects.filter(
                user=goal.user,
                date=today
            ).aggregate(total_steps=Sum('steps'))
            goal.current_value = today_log['total_steps'] or 0
        elif goal.goal_type == 'weekly_calories':
            week_logs = ActivityLog.objects.filter(
                user=goal.user,
                date__gte=week_start,
                date__lte=today
            ).aggregate(total_calories=Sum('calories_burned'))
            goal.current_value = week_logs['total_calories'] or 0
        
        if goal.target_value > 0 and goal.current_value >= goal.target_value:
            goal.achieved = True
        
        goal.save()
        return goal
