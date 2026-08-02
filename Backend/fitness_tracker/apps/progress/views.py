from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Max, Count
from django.db.models.functions import TruncWeek
from apps.users.models import WeightLog
from apps.workouts.models import Workout, WorkoutSet
from apps.activity.models import ActivityLog
from .serializers import (
    WeightTrendSerializer,
    WorkoutFrequencySerializer,
    PRSerializer,
    ComparisonSerializer,
    WeightProgressionSerializer,
)


class WeightTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        range_days = int(request.query_params.get('range', 30))
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=range_days)
        
        logs = WeightLog.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
        
        serializer = WeightTrendSerializer(logs, many=True)
        return Response(serializer.data)


class WorkoutFrequencyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        range_days = int(request.query_params.get('range', 90))
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=range_days)
        
        workouts = Workout.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).annotate(
            week_start=TruncWeek('date')
        ).values('week_start').annotate(
            workout_count=Count('id')
        ).order_by('week_start')
        
        data = [{'week_start': w['week_start'], 'workout_count': w['workout_count']} for w in workouts]
        serializer = WorkoutFrequencySerializer(data, many=True)
        return Response(serializer.data)


class PersonalRecordsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        prs = WorkoutSet.objects.filter(
            workout_exercise__workout__user=request.user,
            weight_kg__isnull=False
        ).values(
            'workout_exercise__exercise__name'
        ).annotate(
            max_weight=Max('weight_kg'),
            date=Max('workout_exercise__workout__date')
        ).order_by('-date')
        
        data = [
            {
                'exercise_name': pr['workout_exercise__exercise__name'],
                'max_weight': pr['max_weight'],
                'date': pr['date']
            }
            for pr in prs
        ]
        serializer = PRSerializer(data, many=True)
        return Response(serializer.data)

class WeightProgressionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, exercise_id):
        sets = (
            WorkoutSet.objects.filter(
                workout_exercise__workout__user=request.user,
                workout_exercise__exercise_id=exercise_id,
                weight_kg__isnull=False,
            )
            .values("workout_exercise__workout__date")
            .annotate(weight_kg=Max("weight_kg"))
            .order_by("workout_exercise__workout__date")
        )

        data = [
            {
                "date": s["workout_exercise__workout__date"],
                "weight_kg": s["weight_kg"],
            }
            for s in sets
        ]

        serializer = WeightProgressionSerializer(data, many=True)
        return Response(serializer.data)

class ComparisonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        
        end_date = timezone.now().date()
        if period == 'week':
            current_start = end_date - timezone.timedelta(days=6)
            previous_start = current_start - timezone.timedelta(days=7)
            previous_end = current_start - timezone.timedelta(days=1)
        else:
            current_start = end_date - timezone.timedelta(days=29)
            previous_start = current_start - timezone.timedelta(days=30)
            previous_end = current_start - timezone.timedelta(days=1)
        
        def get_stats(start, end):
            workouts = Workout.objects.filter(
                user=request.user,
                date__gte=start,
                date__lte=end
            ).count()
            
            activity = ActivityLog.objects.filter(
                user=request.user,
                date__gte=start,
                date__lte=end
            ).aggregate(
                total_steps=Sum('steps'),
                total_calories=Sum('calories_burned')
            )
            
            return {
                'workouts': workouts,
                'steps': activity['total_steps'] or 0,
                'calories': activity['total_calories'] or 0
            }
        
        current = get_stats(current_start, end_date)
        previous = get_stats(previous_start, previous_end)
        
        data = [
            {'period': 'current', **current},
            {'period': 'previous', **previous}
        ]
        serializer = ComparisonSerializer(data, many=True)
        return Response(serializer.data)
