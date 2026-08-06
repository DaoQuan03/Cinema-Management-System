# apps/common/models.py
from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    is_deleted = models.BooleanField(default=False, verbose_name="Đã xóa mềm")

    class Meta:
        abstract = True
