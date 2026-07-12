from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView, UpdateAPIView
from .serializer import RegisterSerializer, ProfileSerializer, OnboardingSerializer
from .models import Profile
from rest_framework.permissions import IsAuthenticated


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

class MeView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    
class OnboardingView(UpdateAPIView):
    serializer_class = OnboardingSerializer

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