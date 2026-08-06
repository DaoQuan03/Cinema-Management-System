# apps/products/models.py
from django.db import models

from apps.common.models import TimeStampedModel

class ComboFNB(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Tên combo bắp nước")
    description = models.TextField(blank=True, verbose_name="Mô tả sản phẩm")
    price = models.DecimalField(max_digits=12, decimal_places=0, default=75000, verbose_name="Giá bán")
    image_url = models.URLField(max_length=1000, blank=True, verbose_name="Hình ảnh")
    is_active = models.BooleanField(default=True, verbose_name="Đang kinh doanh")

    class Meta:
        verbose_name = "Combo Bắp Nước"
        verbose_name_plural = "Danh sách Combo Bắp Nước"

    def __str__(self):
        return f"{self.name} ({self.price:,}đ)"

class Voucher(TimeStampedModel):
    code = models.CharField(max_length=50, unique=True, verbose_name="Mã giảm giá")
    discount_percent = models.PositiveIntegerField(default=0, verbose_name="Phần trăm giảm (%)")
    max_discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=50000, verbose_name="Giảm tối đa")
    min_order_value = models.DecimalField(max_digits=12, decimal_places=0, default=100000, verbose_name="Giá trị đơn tối thiểu")
    expiration_date = models.DateField(verbose_name="Hạn sử dụng")
    is_active = models.BooleanField(default=True, verbose_name="Đang hiệu lực")

    class Meta:
        verbose_name = "Mã giảm giá"
        verbose_name_plural = "Danh sách mã giảm giá"

    def is_valid_for_order(self, order_total):
        if not self.is_active:
            return False, "Mã giảm giá không còn hiệu lực."
        if order_total < self.min_order_value:
            return False, f"Đơn hàng phải tối thiểu {self.min_order_value:,}đ để dùng mã này."
        return True, "Hợp lệ"

    def calculate_discount(self, order_total):
        valid, msg = self.is_valid_for_order(order_total)
        if not valid:
            return 0
        discount = (order_total * self.discount_percent) / 100
        return min(discount, float(self.max_discount_amount))
