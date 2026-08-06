# apps/products/serializers.py
from rest_framework import serializers
from apps.products.models import ComboFNB, Voucher

class ComboFNBSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComboFNB
        fields = ['id', 'name', 'description', 'price', 'image_url', 'is_active']

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['id', 'code', 'discount_percent', 'max_discount_amount', 'min_order_value', 'expiration_date', 'is_active']
