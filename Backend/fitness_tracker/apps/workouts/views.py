from rest_framework import viewsets, generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Exercise, Workout
from .serializers import (
    ExerciseSerializer,
    WorkoutSerializer,
    WorkoutListSerializer,
)


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, is_custom=True)


class WorkoutViewSet(viewsets.ModelViewSet):
    queryset = Workout.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutListSerializer
        return WorkoutSerializer
    
    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user).order_by('-date', '-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecentWorkoutsView(generics.ListAPIView):
    serializer_class = WorkoutListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user).order_by('-date', '-created_at')[:5]
