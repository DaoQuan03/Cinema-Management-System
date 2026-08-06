# apps/cinemas/models.py
from django.db import models
from apps.common.models import TimeStampedModel
from apps.common.enums import RoomType, SeatType

class Cinema(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Tên cụm rạp")
    address = models.CharField(max_length=500, verbose_name="Địa chỉ")
    city = models.CharField(max_length=100, verbose_name="Thành phố")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Số điện thoại")

    class Meta:
        verbose_name = "Cụm rạp"
        verbose_name_plural = "Danh sách cụm rạp"

    def __str__(self):
        return f"{self.name} - {self.city}"

class Room(TimeStampedModel):
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name='rooms', verbose_name="Cụm rạp")
    name = models.CharField(max_length=100, verbose_name="Tên phòng chiếu")
    room_type = models.CharField(max_length=30, choices=RoomType.choices, default=RoomType.STANDARD_2D, verbose_name="Loại phòng")
    total_seats = models.PositiveIntegerField(default=100, verbose_name="Tổng số ghế")

    class Meta:
        verbose_name = "Phòng chiếu"
        verbose_name_plural = "Danh sách phòng chiếu"

    def __str__(self):
        return f"{self.cinema.name} - {self.name}"

class Seat(TimeStampedModel):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='seats', verbose_name="Phòng chiếu")
    seat_number = models.CharField(max_length=10, verbose_name="Số ghế (A1, A2...)")
    row_name = models.CharField(max_length=5, verbose_name="Hàng ghế")
    col_index = models.PositiveIntegerField(default=1, verbose_name="Cột ghế")
    seat_type = models.CharField(max_length=20, choices=SeatType.choices, default=SeatType.STANDARD, verbose_name="Loại ghế")
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")

    class Meta:
        verbose_name = "Ghế ngồi"
        verbose_name_plural = "Danh sách ghế ngồi"
        unique_together = ('room', 'seat_number')

    def __str__(self):
        return f"{self.room.name} - {self.seat_number} ({self.get_seat_type_display()})"
