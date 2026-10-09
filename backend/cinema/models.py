from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email là bắt buộc')
        email = self.normalize_email(email)
        username = extra_fields.get('username') or email.split('@')[0]
        extra_fields.setdefault('username', username)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Administrator'),
        ('Staff', 'Nhân viên rạp'),
        ('User', 'Khách hàng'),
    )
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='User')
    phone = models.CharField(max_length=20, blank=True, default='')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name or self.email} ({self.role})"


class Movie(models.Model):
    STATUS_CHOICES = (
        ('active', 'Đang chiếu'),
        ('upcoming', 'Sắp chiếu'),
    )
    title = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10, default='🎬')
    genre = models.CharField(max_length=100, default='Hành động')
    duration = models.IntegerField(default=120)  # Thời lượng tính theo phút
    rating = models.FloatField(default=8.5)
    start_date = models.CharField(max_length=50, blank=True, default='20/02/2026')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    c1 = models.CharField(max_length=30, default='#1a0a2e')
    c2 = models.CharField(max_length=30, default='#3d1f5e')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title


class Room(models.Model):
    ROOM_TYPE_CHOICES = (
        ('IMAX', 'IMAX'),
        ('4DX', '4DX'),
        ('2D', '2D'),
        ('3D', '3D'),
    )
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='2D')
    total_seats = models.IntegerField(default=120)
    status = models.CharField(max_length=50, default='Hoạt động')
    usage_pct = models.IntegerField(default=50)

    def __str__(self):
        return self.name


class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='showtimes')
    show_date = models.CharField(max_length=20, default='2026-02-27')
    start_time = models.CharField(max_length=10, default='19:00')
    price_std = models.IntegerField(default=90000)
    price_vip = models.IntegerField(default=130000)
    price_sweet = models.IntegerField(default=220000)

    class Meta:
        ordering = ['show_date', 'start_time']

    def __str__(self):
        return f"{self.movie.title} - {self.room.name} ({self.show_date} {self.start_time})"


class Ticket(models.Model):
    STATUS_CHOICES = (
        ('active', 'Đã đặt'),
        ('used', 'Đã check-in'),
        ('cancelled', 'Đã hủy'),
    )
    ticket_code = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    customer = models.CharField(max_length=150, default='Khách hàng')
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    movie = models.CharField(max_length=200)
    room = models.CharField(max_length=100, default='Phòng 1 - IMAX')
    showtime = models.ForeignKey(Showtime, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    time = models.CharField(max_length=50, default='19:00')
    seats = models.CharField(max_length=200)
    total = models.CharField(max_length=50, default='0đ')
    total_amount = models.IntegerField(default=0)
    payment_method = models.CharField(max_length=50, default='Tiền mặt')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket #{self.ticket_code} - {self.customer}"


class BookedSeat(models.Model):
    STATUS_CHOICES = (
        ('BOOKED', 'Đã đặt'),
        ('HELD', 'Đang giữ'),
    )
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name='booked_seats')
    seat_id = models.CharField(max_length=10)
    ticket = models.ForeignKey(Ticket, on_delete=models.SET_NULL, null=True, blank=True, related_name='seat_items')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BOOKED')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('showtime', 'seat_id')

    def __str__(self):
        return f"Showtime {self.showtime_id} - Seat {self.seat_id} ({self.status})"


class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    movie_title = models.CharField(max_length=200, blank=True, default='')
    user = models.CharField(max_length=150, default='Khách hàng')
    role = models.CharField(max_length=50, default='Khách hàng VIP')
    stars = models.IntegerField(default=5)
    text = models.TextField()
    date = models.CharField(max_length=50, default='Hôm nay')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.stars}★ ({self.movie_title})"
