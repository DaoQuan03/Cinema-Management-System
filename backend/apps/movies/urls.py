# apps/movies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.movies.views import MovieViewSet

router = DefaultRouter()
router.register(r'movies', MovieViewSet, basename='movie')

urlpatterns = [
    path('', include(router.urls)),
]
