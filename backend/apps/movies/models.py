# apps/movies/models.py
from django.db import models
from apps.common.models import TimeStampedModel
from apps.common.enums import MovieStatus
from apps.users.models import User

class Movie(TimeStampedModel):
    title = models.CharField(max_length=255, verbose_name="Tên phim")
    description = models.TextField(blank=True, verbose_name="Mô tả nội dung")
    director = models.CharField(max_length=100, blank=True, verbose_name="Đạo diễn")
    cast = models.CharField(max_length=500, blank=True, verbose_name="Diễn viên")
    genre = models.CharField(max_length=100, verbose_name="Thể loại")
    duration_mins = models.PositiveIntegerField(default=120, verbose_name="Thời lượng (Phút)")
    rating = models.FloatField(default=8.0, verbose_name="Đánh giá sao")
    poster_url = models.URLField(max_length=1000, blank=True, verbose_name="URL Poster")
    trailer_url = models.URLField(max_length=1000, blank=True, verbose_name="URL Trailer YouTube")
    age_rating = models.CharField(max_length=20, default="C13", verbose_name="Giới hạn tuổi")
    language = models.CharField(max_length=100, default="Tiếng Anh - Phụ đề Tiếng Việt", verbose_name="Ngôn ngữ")
    badge = models.CharField(max_length=20, default="HOT", verbose_name="Nhãn dán")
    release_year = models.PositiveIntegerField(default=2025, verbose_name="Năm sản xuất")
    vote_count = models.PositiveIntegerField(default=500, verbose_name="Số lượt đánh giá")
    release_date = models.DateField(null=True, blank=True, verbose_name="Ngày khởi chiếu")
    status = models.CharField(max_length=20, choices=MovieStatus.choices, default=MovieStatus.SHOWING, verbose_name="Trạng thái")

    class Meta:
        verbose_name = "Phim"
        verbose_name_plural = "Danh sách phim"

    def __str__(self):
        return self.title

    def calculate_average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.rating = round(avg, 1)
            self.save()
        return self.rating

class Review(TimeStampedModel):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews', verbose_name="Phim")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name="Người đánh giá")
    rating = models.PositiveSmallIntegerField(default=5, verbose_name="Điểm (1-5)")
    comment = models.TextField(verbose_name="Bình luận")

    class Meta:
        verbose_name = "Đánh giá phim"
        verbose_name_plural = "Danh sách đánh giá"
