from rest_framework import serializers
from .models import User, Movie, Room, Showtime, Ticket, BookedSeat, Review

class UserSerializer(serializers.ModelSerializer):
    joined = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'phone', 'joined', 'is_active']

    def get_joined(self, obj):
        return obj.date_joined.strftime('%d/%m/%Y') if obj.date_joined else '20/02/2026'


class MovieSerializer(serializers.ModelSerializer):
    startDate = serializers.CharField(source='start_date', required=False)

    class Meta:
        model = Movie
        fields = ['id', 'title', 'emoji', 'genre', 'duration', 'rating', 'start_date', 'startDate', 'status', 'c1', 'c2', 'description']

    def create(self, validated_data):
        if 'start_date' not in validated_data and 'startDate' in self.initial_data:
            validated_data['start_date'] = self.initial_data['startDate']
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'room_type', 'total_seats', 'status', 'usage_pct']


class ShowtimeSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Showtime
        fields = [
            'id', 'movie', 'movie_title', 'room', 'room_name',
            'show_date', 'start_time', 'price_std', 'price_vip', 'price_sweet',
            'available_seats'
        ]

    def get_available_seats(self, obj):
        total = obj.room.total_seats if obj.room else 120
        booked = obj.booked_seats.filter(status='BOOKED').count()
        return f"{max(0, total - booked)}/{total}"


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_code', 'customer', 'customer_phone',
            'movie', 'room', 'showtime', 'time', 'seats',
            'total', 'total_amount', 'payment_method', 'status', 'created_at'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'movie', 'movie_title', 'user', 'role', 'stars', 'text', 'date', 'created_at']
