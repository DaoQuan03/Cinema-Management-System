from django.urls import path
from .views import (
    LoginView, RegisterView, CurrentUserView,
    MovieListCreateView, MovieDetailView,
    RoomListCreateView,
    ShowtimeListCreateView, ShowtimeDetailView, ShowtimeSeatsView,
    TicketListCreateView, TicketCancelView, MyTicketsView,
    ReviewListCreateView,
    DashboardStatsView, RevenueReportView,
    UserListCreateView
)

urlpatterns = [
    # Auth
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/me/', CurrentUserView.as_view(), name='api-me'),

    # Movies
    path('movies/', MovieListCreateView.as_view(), name='api-movies'),
    path('movies/<int:pk>/', MovieDetailView.as_view(), name='api-movie-detail'),

    # Rooms
    path('rooms/', RoomListCreateView.as_view(), name='api-rooms'),

    # Showtimes
    path('showtimes/', ShowtimeListCreateView.as_view(), name='api-showtimes'),
    path('showtimes/<int:pk>/', ShowtimeDetailView.as_view(), name='api-showtime-detail'),
    path('showtimes/<int:pk>/seats/', ShowtimeSeatsView.as_view(), name='api-showtime-seats'),

    # Tickets & Booking
    path('tickets/', TicketListCreateView.as_view(), name='api-tickets'),
    path('tickets/<int:pk>/cancel/', TicketCancelView.as_view(), name='api-ticket-cancel'),
    path('tickets/my-tickets/', MyTicketsView.as_view(), name='api-my-tickets'),

    # Reviews
    path('reviews/', ReviewListCreateView.as_view(), name='api-reviews'),

    # Dashboard & Reports
    path('dashboard/stats/', DashboardStatsView.as_view(), name='api-dashboard-stats'),
    path('reports/revenue/', RevenueReportView.as_view(), name='api-reports-revenue'),

    # Users
    path('users/', UserListCreateView.as_view(), name='api-users'),
]
