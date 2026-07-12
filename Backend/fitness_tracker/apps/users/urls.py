from django.urls import path
from .views import RegisterView, MeView, ProfileView, OnboardingView ,LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

    path('/api/auth/register/', RegisterView.as_view(), name='register'),
    path('/api/users/login/', TokenObtainPairView.as_view(), name='login'),
    path('/api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('/api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('/api/profile/', ProfileView.as_view(), name='profile'),
    path('/api/profile/', ProfileView.as_view(), name='profile_update'),
    path('/api/profile/onboarding/', OnboardingView.as_view(), name='onboarding'),

    path('/api/users/me/', MeView.as_view(), name='me'),
]