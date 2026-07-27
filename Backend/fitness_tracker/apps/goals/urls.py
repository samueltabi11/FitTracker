from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, GoalProgressView

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('goals/<int:pk>/progress/', GoalProgressView.as_view(), name='goal-progress'),
] + router.urls
