# apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import register_api, login_api, profile_api, AdminUserViewSet

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('auth/register/', register_api, name='api-register'),
    path('auth/login/', login_api, name='api-login'),
    path('auth/profile/', profile_api, name='api-profile'),
    path('', include(router.urls)),
]
