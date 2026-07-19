from django.urls import path
from . import views

urlpatterns = [
    path('progress/weight-trend/', views.WeightTrendView.as_view(), name='weight-trend'),
    path('progress/workout-frequency/', views.WorkoutFrequencyView.as_view(), name='workout-frequency'),
    path('progress/personal-records/', views.PersonalRecordsView.as_view(), name='personal-records'),
    path('progress/comparison/', views.ComparisonView.as_view(), name='comparison'),
]
