# apps/cinemas/views.py
from rest_framework import viewsets, permissions
from apps.cinemas.models import Cinema, Room, Seat
from apps.cinemas.serializers import CinemaSerializer, RoomSerializer, SeatSerializer

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all().order_by('id')
    serializer_class = CinemaSerializer
    permission_classes = [permissions.AllowAny]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('id')
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all().order_by('id')
    serializer_class = SeatSerializer
    permission_classes = [permissions.AllowAny]
