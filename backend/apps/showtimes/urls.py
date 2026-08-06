# apps/showtimes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.showtimes.views import ShowtimeViewSet

router = DefaultRouter()
router.register(r'showtimes', ShowtimeViewSet, basename='showtime')

urlpatterns = [
    path('', include(router.urls)),
]
