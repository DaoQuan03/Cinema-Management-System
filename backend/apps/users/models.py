# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.models import TimeStampedModel
from apps.common.enums import UserRole

class User(AbstractUser, TimeStampedModel):
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Số điện thoại")
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        verbose_name="Vai trò"
    )
    loyalty_points = models.PositiveIntegerField(default=0, verbose_name="Điểm tích lũy")
    membership_tier = models.CharField(max_length=20, default="Silver", verbose_name="Hạng thành viên")

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Danh sách người dùng"

    def has_role(self, target_role):
        return self.role == target_role

    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_staff_user(self):
        return self.role in [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] or self.is_staff

    def add_points(self, points):
        self.loyalty_points += points
        if self.loyalty_points >= 1000:
            self.membership_tier = "Diamond"
        elif self.loyalty_points >= 300:
            self.membership_tier = "Gold"
        self.save()
