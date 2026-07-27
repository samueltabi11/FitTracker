from django.urls import path
from .views import RegisterView, MeView, ProfileView, OnboardingView ,LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/onboarding/', OnboardingView.as_view(), name='onboarding'),
    path('users/me/', MeView.as_view(), name='me'),
]