# apps/showtimes/models.py
from django.db import models
from apps.common.models import TimeStampedModel
from apps.movies.models import Movie
from apps.cinemas.models import Room

class Showtime(TimeStampedModel):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes', verbose_name="Phim")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='showtimes', verbose_name="Phòng chiếu")
    start_time = models.DateTimeField(verbose_name="Thời gian bắt đầu")
    end_time = models.DateTimeField(verbose_name="Thời gian kết thúc")
    price_standard = models.DecimalField(max_length=10, max_digits=12, decimal_places=0, default=100000, verbose_name="Giá vé thường")
    price_vip = models.DecimalField(max_length=10, max_digits=12, decimal_places=0, default=150000, verbose_name="Giá vé VIP")
    price_sweetbox = models.DecimalField(max_length=10, max_digits=12, decimal_places=0, default=200000, verbose_name="Giá vé Sweetbox")

    class Meta:
        verbose_name = "Suất chiếu"
        verbose_name_plural = "Danh sách suất chiếu"

    def __str__(self):
        return f"{self.movie.title} - {self.room.name} ({self.start_time.strftime('%H:%M %d/%m/%Y')})"

    def has_time_overlap(self):
        overlaps = Showtime.objects.filter(
            room=self.room,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        ).exclude(pk=self.pk)
        return overlaps.exists()
