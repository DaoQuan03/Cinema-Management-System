# apps/products/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.products.models import ComboFNB, Voucher
from apps.products.serializers import ComboFNBSerializer, VoucherSerializer

class ComboFNBViewSet(viewsets.ModelViewSet):
    queryset = ComboFNB.objects.filter(is_active=True).order_by('id')
    serializer_class = ComboFNBSerializer
    permission_classes = [permissions.AllowAny]

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all().order_by('-id')
    serializer_class = VoucherSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def apply_voucher_api(request):
    code = request.data.get('code', '').strip().upper()
    order_total = float(request.data.get('orderTotal', 0))

    voucher = Voucher.objects.filter(code=code, is_active=True).first()
    if not voucher:
        return Response({'message': 'Mã giảm giá không tồn tại hoặc đã hết hạn'}, status=status.HTTP_400_BAD_REQUEST)

    is_valid, msg = voucher.is_valid_for_order(order_total)
    if not is_valid:
        return Response({'message': msg}, status=status.HTTP_400_BAD_REQUEST)

    discount = voucher.calculate_discount(order_total)
    return Response({
        'valid': True,
        'code': voucher.code,
        'discount_amount': discount,
        'final_amount': max(0, order_total - discount),
        'message': f'Áp dụng thành công mã giảm {discount:,}đ'
    })
