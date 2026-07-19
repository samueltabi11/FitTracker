from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView, UpdateAPIView
from .serializer import RegisterSerializer, ProfileSerializer, OnboardingSerializer, UserSerializer
from .models import Profile
from rest_framework.permissions import IsAuthenticated, AllowAny


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserSerializer
        return ProfileSerializer

    def get_object(self):
        if self.request.method in ['PUT', 'PATCH']:
            return self.request.user
        return Profile.objects.get(user=self.request.user)


class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    

class OnboardingView(UpdateAPIView):
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(onboarding_completed=True)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()
            return Response(status=205)
        except Exception:
            return Response(status=400)