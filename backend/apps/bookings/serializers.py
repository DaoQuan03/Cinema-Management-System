# apps/bookings/serializers.py
from rest_framework import serializers
from apps.bookings.models import Booking, BookingSeat, BookingCombo

class BookingSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='seat.seat_number', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat', 'seat_number', 'price']

class BookingComboSerializer(serializers.ModelSerializer):
    combo_name = serializers.CharField(source='combo.name', read_only=True)

    class Meta:
        model = BookingCombo
        fields = ['id', 'combo', 'combo_name', 'quantity', 'price']

class BookingSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='showtime.movie.title', read_only=True)
    movie_poster = serializers.CharField(source='showtime.movie.poster_url', read_only=True)
    room_name = serializers.CharField(source='showtime.room.name', read_only=True)
    cinema_name = serializers.CharField(source='showtime.room.cinema.name', read_only=True)
    showtime_start = serializers.DateTimeField(source='showtime.start_time', read_only=True)
    seats = BookingSeatSerializer(many=True, read_only=True)
    combos = BookingComboSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'ticket_code', 'user', 'showtime', 'movie_title', 'movie_poster',
            'room_name', 'cinema_name', 'showtime_start', 'total_ticket_price',
            'total_fnb_price', 'discount_amount', 'final_total', 'payment_method',
            'booking_status', 'created_at', 'seats', 'combos'
        ]
