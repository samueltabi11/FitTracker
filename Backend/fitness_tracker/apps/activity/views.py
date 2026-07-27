from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Avg
from django_filters.rest_framework import DjangoFilterBackend
from .models import ActivityLog
from .serializers import ActivityLogSerializer, ActivitySummarySerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'source']

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TodayActivityView(generics.RetrieveAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        today = timezone.now().date()
        activity, created = ActivityLog.objects.get_or_create(
            user=self.request.user,
            date=today,
            source="manual",
            defaults={'steps': 0, 'active_minutes': 0}
        )
        return activity


class ActivitySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        
        end_date = timezone.now().date()
        if period == 'week':
            start_date = end_date - timezone.timedelta(days=7)
        elif period == 'month':
            start_date = end_date - timezone.timedelta(days=30)
        else:
            start_date = end_date - timezone.timedelta(days=7)
        
        logs = ActivityLog.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        summary = logs.aggregate(
            total_steps=Sum('steps'),
            total_calories=Sum('calories_burned'),
            total_active_minutes=Sum('active_minutes'),
            total_distance=Sum('distance_km')
        )
        
        days = (end_date - start_date).days + 1
        avg_steps = summary['total_steps'] / days if summary['total_steps'] else 0
        
        data = {
            'total_steps': summary['total_steps'] or 0,
            'total_calories': summary['total_calories'] or 0,
            'total_active_minutes': summary['total_active_minutes'] or 0,
            'total_distance': summary['total_distance'] or 0,
            'average_steps_per_day': avg_steps
        }
        
        serializer = ActivitySummarySerializer(data)
        return Response(serializer.data)


class ActivitySyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logs_data = request.data.get('logs', [])
        
        created_logs = []
        for log_data in logs_data:
            serializer = ActivityLogSerializer(data=log_data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                created_logs.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(created_logs, status=status.HTTP_201_CREATED)
