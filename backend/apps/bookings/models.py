# apps/bookings/models.py
import uuid
from django.db import models
from apps.common.models import TimeStampedModel
from apps.common.enums import PaymentMethod, BookingStatus
from apps.users.models import User
from apps.showtimes.models import Showtime
from apps.cinemas.models import Seat
from apps.products.models import ComboFNB, Voucher

class Booking(TimeStampedModel):
    ticket_code = models.CharField(max_length=50, unique=True, verbose_name="Mã vé QR")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', verbose_name="Khách hàng")
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name='bookings', verbose_name="Suất chiếu")
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mã giảm giá")
    
    total_ticket_price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng tiền vé")
    total_fnb_price = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng tiền bắp nước")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tiền giảm giá")
    final_total = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng thanh toán")
    
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices, default=PaymentMethod.CREDIT_CARD, verbose_name="Phương thức thanh toán")
    booking_status = models.CharField(max_length=30, choices=BookingStatus.choices, default=BookingStatus.CONFIRMED, verbose_name="Trạng thái đơn hàng")

    class Meta:
        verbose_name = "Vé & Đơn hàng"
        verbose_name_plural = "Danh sách vé & đơn hàng"

    def __str__(self):
        return f"{self.ticket_code} - {self.user.username} ({self.showtime.movie.title})"

    @staticmethod
    def generate_ticket_code():
        return f"CVE-2025-{uuid.uuid4().hex[:5].upper()}"

    def recalculate_totals(self):
        # Calculate tickets
        seats_price = sum(item.price for item in self.seats.all())
        # Calculate F&B
        fnb_price = sum(item.price * item.quantity for item in self.combos.all())
        
        self.total_ticket_price = seats_price
        self.total_fnb_price = fnb_price
        
        subtotal = seats_price + fnb_price
        if self.voucher:
            self.discount_amount = self.voucher.calculate_discount(subtotal)
        else:
            self.discount_amount = 0
            
        self.final_total = max(0, subtotal - self.discount_amount)
        self.save()

class BookingSeat(TimeStampedModel):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='seats', verbose_name="Đơn hàng")
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, verbose_name="Ghế ngồi")
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Giá ghế")

    class Meta:
        verbose_name = "Ghế trong đơn"
        verbose_name_plural = "Danh sách ghế trong đơn"
        unique_together = ('booking', 'seat')

class BookingCombo(TimeStampedModel):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='combos', verbose_name="Đơn hàng")
    combo = models.ForeignKey(ComboFNB, on_delete=models.CASCADE, verbose_name="Combo bắp nước")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Số lượng")
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Đơn giá")

    class Meta:
        verbose_name = "Bắp nước trong đơn"
        verbose_name_plural = "Danh sách bắp nước trong đơn"
