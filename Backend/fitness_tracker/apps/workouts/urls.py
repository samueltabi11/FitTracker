from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, WorkoutViewSet, RecentWorkoutsView

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'workouts', WorkoutViewSet, basename='workout')

urlpatterns = [
    path('workouts/recent/', RecentWorkoutsView.as_view(), name='recent-workouts'),
] + router.urls
