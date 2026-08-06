# apps/showtimes/serializers.py
from rest_framework import serializers
from apps.showtimes.models import Showtime
from apps.movies.serializers import MovieSerializer
from apps.cinemas.serializers import RoomSerializer

class ShowtimeSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    movie_poster = serializers.CharField(source='movie.poster_url', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    cinema_name = serializers.CharField(source='room.cinema.name', read_only=True)
    occupied_seats = serializers.SerializerMethodField()

    class Meta:
        model = Showtime
        fields = [
            'id', 'movie', 'movie_title', 'movie_poster', 'room', 'room_name',
            'cinema_name', 'start_time', 'end_time', 'price_standard', 'price_vip',
            'price_sweetbox', 'occupied_seats'
        ]

    def get_occupied_seats(self, obj):
        from apps.bookings.models import BookingSeat
        booked_seats = BookingSeat.objects.filter(booking__showtime=obj, booking__booking_status__in=['CONFIRMED', 'CHECKED_IN'])
        return [seat.seat.seat_number for seat in booked_seats]
