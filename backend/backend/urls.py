# backend/urls.py
from django.contrib import admin
from django.urls import path, re_path, include
from backend.views import serve_frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.cinemas.urls')),
    path('api/', include('apps.movies.urls')),
    path('api/', include('apps.showtimes.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.bookings.urls')),
    
    # Serve Frontend Web App at root localhost URL http://127.0.0.1:8000/
    path('', serve_frontend, kwargs={'path': 'index.html'}, name='frontend-root'),
    re_path(r'^(?P<path>.*)$', serve_frontend, name='frontend-static'),
]
