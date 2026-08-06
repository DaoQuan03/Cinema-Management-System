# apps/showtimes/views.py
from rest_framework import viewsets, permissions
from apps.showtimes.models import Showtime
from apps.showtimes.serializers import ShowtimeSerializer

class ShowtimeViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.all().order_by('start_time')
    serializer_class = ShowtimeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Showtime.objects.all()
        movie_id = self.request.query_params.get('movie_id', None)
        cinema_id = self.request.query_params.get('cinema_id', None)
        date_str = self.request.query_params.get('date', None)

        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        if cinema_id:
            queryset = queryset.filter(room__cinema_id=cinema_id)
        if date_str:
            queryset = queryset.filter(start_time__date=date_str)

        return queryset
