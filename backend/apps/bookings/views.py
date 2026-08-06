# apps/bookings/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response

from apps.bookings.models import Booking, BookingSeat, BookingCombo
from apps.bookings.serializers import BookingSerializer
from apps.showtimes.models import Showtime
from apps.cinemas.models import Seat
from apps.products.models import ComboFNB, Voucher
from apps.common.enums import BookingStatus

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-id')
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user if request.user.is_authenticated else None
        
        # If guest/pos user without auth, fallback to default first user
        if not user:
            from apps.users.models import User
            user = User.objects.filter(role='CUSTOMER').first() or User.objects.first()

        showtime_id = data.get('showtimeId')
        seat_numbers = data.get('seats', [])
        fnb_items = data.get('fnbItems', [])
        voucher_code = data.get('voucherCode', None)
        payment_method = data.get('paymentMethod', 'CREDIT_CARD')

        showtime = Showtime.objects.filter(id=showtime_id).first()
        if not showtime:
            return Response({'message': 'Suất chiếu không tồn tại'}, status=status.HTTP_400_BAD_REQUEST)

        voucher = Voucher.objects.filter(code=voucher_code, is_active=True).first() if voucher_code else None

        # Create Booking instance
        booking = Booking.objects.create(
            ticket_code=Booking.generate_ticket_code(),
            user=user,
            showtime=showtime,
            voucher=voucher,
            payment_method=payment_method,
            booking_status=BookingStatus.CONFIRMED
        )

        # Attach Seats
        for seat_num in seat_numbers:
            seat_obj = Seat.objects.filter(room=showtime.room, seat_number=seat_num).first()
            if seat_obj:
                price = showtime.price_vip if seat_obj.seat_type == 'VIP' else (showtime.price_sweetbox if seat_obj.seat_type == 'SWEETBOX' else showtime.price_standard)
                BookingSeat.objects.create(booking=booking, seat=seat_obj, price=price)

        # Attach F&B Combos
        for fnb in fnb_items:
            combo_obj = ComboFNB.objects.filter(id=fnb.get('id')).first()
            qty = int(fnb.get('qty', 1))
            if combo_obj and qty > 0:
                BookingCombo.objects.create(booking=booking, combo=combo_obj, quantity=qty, price=combo_obj.price)

        # Recalculate totals & loyalty points
        booking.recalculate_totals()
        if user:
            user.add_points(int(booking.final_total / 10000))

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_tickets(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-id')
        return Response(BookingSerializer(bookings, many=True).data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def checkin_ticket_api(request):
    code = request.data.get('ticketCode', '').strip().upper()
    booking = Booking.objects.filter(ticket_code=code).first()

    if not booking:
        return Response({'message': 'Mã vé không tồn tại trong hệ thống!'}, status=status.HTTP_404_NOT_FOUND)

    if booking.booking_status == BookingStatus.CHECKED_IN:
        return Response({'message': 'Vé này đã được check-in trước đó!'}, status=status.HTTP_400_BAD_REQUEST)

    booking.booking_status = BookingStatus.CHECKED_IN
    booking.save()

    return Response({
        'success': True,
        'message': 'Check-in vé thành công!',
        'ticket': BookingSerializer(booking).data
    })
