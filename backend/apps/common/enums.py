# apps/common/enums.py
from django.db import models

class UserRole(models.TextChoices):
    CUSTOMER = 'CUSTOMER', 'Khách hàng'
    STAFF = 'STAFF', 'Nhân viên quầy'
    MANAGER = 'MANAGER', 'Quản lý chi nhánh'
    ADMIN = 'ADMIN', 'Quản trị viên hệ thống'

class RoomType(models.TextChoices):
    STANDARD_2D = 'STANDARD_2D', 'Standard 2D'
    DIGITAL_3D = 'DIGITAL_3D', 'Digital 3D'
    IMAX_3D = 'IMAX_3D', 'IMAX 3D'
    DOLBY_4DX = 'DOLBY_4DX', '4DX Experience'

class SeatType(models.TextChoices):
    STANDARD = 'STANDARD', 'Ghế thường'
    VIP = 'VIP', 'Ghế VIP'
    SWEETBOX = 'SWEETBOX', 'Ghế đôi Sweetbox'

class MovieStatus(models.TextChoices):
    SHOWING = 'SHOWING', 'Đang chiếu'
    UPCOMING = 'UPCOMING', 'Sắp chiếu'
    STOPPED = 'STOPPED', 'Đã ngừng chiếu'

class PaymentMethod(models.TextChoices):
    CREDIT_CARD = 'CREDIT_CARD', 'Thẻ tín dụng (Visa/Master)'
    MOMO = 'MOMO', 'Ví điện tử MoMo'
    VNPAY = 'VNPAY', 'VNPay QR'
    ZALOPAY = 'ZALOPAY', 'ZaloPay'
    CASH_AT_COUNTER = 'CASH_AT_COUNTER', 'Tiền mặt tại quầy'

class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', 'Chờ thanh toán'
    CONFIRMED = 'CONFIRMED', 'Đã đặt vé'
    CHECKED_IN = 'CHECKED_IN', 'Đã check-in'
    CANCELLED = 'CANCELLED', 'Đã hủy vé'
