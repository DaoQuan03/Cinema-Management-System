# apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import ComboFNBViewSet, VoucherViewSet, apply_voucher_api

router = DefaultRouter()
router.register(r'combos', ComboFNBViewSet, basename='combo')
router.register(r'vouchers', VoucherViewSet, basename='voucher')

urlpatterns = [
    path('vouchers/apply/', apply_voucher_api, name='api-voucher-apply'),
    path('', include(router.urls)),
]
