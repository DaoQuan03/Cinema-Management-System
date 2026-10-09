from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from django.utils import timezone
import random

from .models import User, Movie, Room, Showtime, Ticket, BookedSeat, Review
from .serializers import (
    UserSerializer, MovieSerializer, RoomSerializer,
    ShowtimeSerializer, TicketSerializer, ReviewSerializer
)

# ─── AUTH VIEWS ──────────────────────────────────────────
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '').strip()

        if not email or not password:
            return Response({'detail': 'Vui lòng cung cấp email và mật khẩu.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'Email hoặc mật khẩu không chính xác.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'detail': 'Email hoặc mật khẩu không chính xác.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Token giả lập hoặc token string
        token = f"cinelux-jwt-token-{user.id}-{random.randint(100000, 999999)}"
        return Response({
            'token': token,
            'user': UserSerializer(user).data
        })


class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '').strip()
        name = request.data.get('name', '').strip()
        phone = request.data.get('phone', '').strip()
        role = request.data.get('role', 'User')

        if not email or not password or not name:
            return Response({'detail': 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'Email này đã tồn tại trong hệ thống.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            phone=phone,
            role=role
        )
        token = f"cinelux-jwt-token-{user.id}-{random.randint(100000, 999999)}"
        return Response({
            'token': token,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    def get(self, request):
        # Fallback to first user or demo admin
        user = request.user if request.user.is_authenticated else User.objects.first()
        if not user:
            return Response({'detail': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)


# ─── MOVIES ──────────────────────────────────────────────
class MovieListCreateView(generics.ListCreateAPIView):
    queryset = Movie.objects.all().order_by('-id')
    serializer_class = MovieSerializer


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


# ─── ROOMS ───────────────────────────────────────────────
class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all().order_by('id')
    serializer_class = RoomSerializer


# ─── SHOWTIMES ───────────────────────────────────────────
class ShowtimeListCreateView(generics.ListCreateAPIView):
    serializer_class = ShowtimeSerializer

    def get_queryset(self):
        qs = Showtime.objects.select_related('movie', 'room').all()
        date = self.request.query_params.get('date')
        movie_id = self.request.query_params.get('movie_id')
        if date:
            qs = qs.filter(show_date=date)
        if movie_id:
            qs = qs.filter(movie_id=movie_id)
        return qs


class ShowtimeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer


class ShowtimeSeatsView(APIView):
    def get(self, request, pk):
        try:
            showtime = Showtime.objects.get(pk=pk)
        except Showtime.DoesNotExist:
            return Response({'detail': 'Không tìm thấy suất chiếu.'}, status=status.HTTP_404_NOT_FOUND)

        booked = list(showtime.booked_seats.filter(status='BOOKED').values_list('seat_id', flat=True))
        held = list(showtime.booked_seats.filter(status='HELD').values_list('seat_id', flat=True))
        return Response({
            'showtime_id': showtime.id,
            'room': showtime.room.name if showtime.room else '',
            'total_seats': showtime.room.total_seats if showtime.room else 120,
            'booked_seats': booked,
            'held_seats': held
        })


# ─── TICKETS & BOOKING ───────────────────────────────────
class TicketListCreateView(APIView):
    def get(self, request):
        tickets = Ticket.objects.all().order_by('-created_at')
        return Response(TicketSerializer(tickets, many=True).data)

    def post(self, request):
        data = request.data
        code = data.get('ticket_code') or f"VX-{random.randint(1000, 9999)}"
        seats_raw = data.get('seats', '')
        if isinstance(seats_raw, list):
            seat_list = seats_raw
            seats_str = ", ".join(seats_raw)
        else:
            seats_str = str(seats_raw)
            seat_list = [s.strip() for s in seats_str.split(',') if s.strip()]

        total_amount = int(data.get('total_amount') or 0)
        total_str = data.get('total') or (f"{total_amount:,}đ".replace(',', '.'))

        # Tìm showtime nếu có
        showtime_id = data.get('showtime') or data.get('showtime_id')
        showtime = None
        if showtime_id:
            showtime = Showtime.objects.filter(pk=showtime_id).first()

        ticket = Ticket.objects.create(
            ticket_code=code,
            customer=data.get('customer', 'Khách hàng'),
            customer_phone=data.get('customer_phone', ''),
            movie=data.get('movie', 'Phim CinéLux'),
            room=data.get('room', 'Phòng 1 - IMAX'),
            showtime=showtime,
            time=data.get('time', '19:00'),
            seats=seats_str,
            total=total_str,
            total_amount=total_amount,
            payment_method=data.get('payment_method', 'Tiền mặt'),
            status='active'
        )

        # Lưu ghế đã đặt nếu có showtime
        if showtime:
            for s_id in seat_list:
                BookedSeat.objects.update_or_create(
                    showtime=showtime,
                    seat_id=s_id,
                    defaults={'ticket': ticket, 'status': 'BOOKED'}
                )

        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketCancelView(APIView):
    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'detail': 'Không tìm thấy vé.'}, status=status.HTTP_404_NOT_FOUND)

        ticket.status = 'cancelled'
        ticket.save()
        # Giải phóng ghế
        BookedSeat.objects.filter(ticket=ticket).delete()
        return Response({'detail': 'Hủy vé thành công.', 'ticket': TicketSerializer(ticket).data})


class MyTicketsView(APIView):
    def get(self, request):
        customer_name = request.query_params.get('customer')
        qs = Ticket.objects.all().order_by('-created_at')
        if customer_name:
            qs = qs.filter(customer__iexact=customer_name)
        return Response(TicketSerializer(qs, many=True).data)


# ─── REVIEWS ─────────────────────────────────────────────
class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer


# ─── DASHBOARD STATS & REPORTS ───────────────────────────
class DashboardStatsView(APIView):
    def get(self, request):
        active_tickets = Ticket.objects.exclude(status='cancelled')
        total_rev = active_tickets.aggregate(sum=Sum('total_amount'))['sum'] or 0
        if total_rev == 0:
            # fallback nếu ticket chỉ lưu chuỗi total
            for t in active_tickets:
                digits = "".join([c for c in t.total if c.isdigit()])
                if digits:
                    total_rev += int(digits)

        today_tickets = active_tickets.count()
        active_movies = Movie.objects.filter(status='active').count()
        total_showtimes = Showtime.objects.count()

        # Phim nổi bật
        popular_movies = []
        for m in Movie.objects.all()[:4]:
            t_count = Ticket.objects.filter(movie=m.title).exclude(status='cancelled').count()
            popular_movies.append({
                'id': m.id,
                'title': m.title,
                'emoji': m.emoji,
                'genre': m.genre,
                'duration': m.duration,
                'c1': m.c1,
                'c2': m.c2,
                'showtime_count': Showtime.objects.filter(movie=m).count(),
                'tickets_sold': t_count,
            })

        # Hoạt động gần đây
        recent_tickets = TicketSerializer(Ticket.objects.all().order_by('-created_at')[:3], many=True).data
        recent_reviews = ReviewSerializer(Review.objects.all().order_by('-created_at')[:2], many=True).data

        # Suất chiếu sắp tới
        upcoming_showtimes = ShowtimeSerializer(Showtime.objects.all()[:5], many=True).data

        return Response({
            'total_revenue': total_rev,
            'total_revenue_formatted': f"{total_rev:,}đ".replace(',', '.'),
            'tickets_today': today_tickets,
            'active_movies_count': active_movies,
            'total_showtimes': total_showtimes,
            'occupancy_rate': '74%',
            'popular_movies': popular_movies,
            'recent_tickets': recent_tickets,
            'recent_reviews': recent_reviews,
            'upcoming_showtimes': upcoming_showtimes
        })


class RevenueReportView(APIView):
    def get(self, request):
        return Response({
            'months': ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            'revenue': [45000000, 52000000, 61000000, 58000000, 69000000, 84000000],
            'tickets_count': [420, 510, 590, 560, 680, 810]
        })


# ─── USERS ───────────────────────────────────────────────
class UserListCreateView(APIView):
    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '123456')
        name = request.data.get('name', '').strip()
        phone = request.data.get('phone', '').strip()
        role = request.data.get('role', 'User')

        if not email or not name:
            return Response({'detail': 'Email và họ tên là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'Email này đã tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            phone=phone,
            role=role
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
