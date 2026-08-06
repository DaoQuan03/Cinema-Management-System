# apps/cinemas/serializers.py
from rest_framework import serializers
from apps.cinemas.models import Cinema, Room, Seat

class SeatSerializer(serializers.ModelSerializer):
    seat_type_display = serializers.CharField(source='get_seat_type_display', read_only=True)

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'row_name', 'col_index', 'seat_type', 'seat_type_display', 'is_active']

class RoomSerializer(serializers.ModelSerializer):
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'cinema', 'name', 'room_type', 'room_type_display', 'total_seats', 'seats']

class CinemaSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema
        fields = ['id', 'name', 'address', 'city', 'phone', 'rooms']
