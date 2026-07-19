from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivityLogViewSet, TodayActivityView, ActivitySummaryView, ActivitySyncView

router = DefaultRouter()
router.register(r'activity', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('activity/today/', TodayActivityView.as_view(), name='today-activity'),
    path('activity/summary/', ActivitySummaryView.as_view(), name='activity-summary'),
    path('activity/sync/', ActivitySyncView.as_view(), name='activity-sync'),
] + router.urls
