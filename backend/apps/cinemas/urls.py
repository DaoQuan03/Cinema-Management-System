# apps/cinemas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.cinemas.views import CinemaViewSet, RoomViewSet, SeatViewSet

router = DefaultRouter()
router.register(r'cinemas', CinemaViewSet, basename='cinema')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'seats', SeatViewSet, basename='seat')

urlpatterns = [
    path('', include(router.urls)),
]
