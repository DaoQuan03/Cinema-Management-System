# apps/common/management/commands/seed_data.py
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.common.enums import UserRole, RoomType, SeatType, MovieStatus
from apps.cinemas.models import Cinema, Room, Seat
from apps.movies.models import Movie
from apps.showtimes.models import Showtime
from apps.products.models import ComboFNB, Voucher

class Command(BaseCommand):
    help = 'Nap du lieu mau ban dau cho he thong Rap chieu phim PBL5 (CineVerse)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- BAT DAU NAP DU LIEU MAU ---'))

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@cineverse.com',
                'first_name': 'Super Admin',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        staff_user, _ = User.objects.get_or_create(
            username='staff',
            defaults={
                'email': 'staff@cineverse.com',
                'first_name': 'Tran Van Nam',
                'role': UserRole.STAFF,
                'phone': '0901234567'
            }
        )
        staff_user.set_password('staff123')
        staff_user.save()

        cust_user, _ = User.objects.get_or_create(
            username='user',
            defaults={
                'email': 'user@example.com',
                'first_name': 'Nguyen Van An',
                'role': UserRole.CUSTOMER,
                'loyalty_points': 350,
                'membership_tier': 'Gold'
            }
        )
        cust_user.set_password('user123')
        cust_user.save()

        self.stdout.write(self.style.SUCCESS('OK: Tao 3 Tai khoan mau: admin/admin123, staff/staff123, user/user123'))

        # 2. Cinema & Rooms
        cinema, _ = Cinema.objects.get_or_create(
            name='CineVerse Q.1',
            defaults={'address': '123 Nguyen Trai, Quan 1', 'city': 'TP. Ho Chi Minh', 'phone': '028 1234 5678'}
        )

        room1, _ = Room.objects.get_or_create(
            cinema=cinema, name='Phong 1 - Standard', defaults={'room_type': RoomType.STANDARD_2D, 'total_seats': 50}
        )
        room2, _ = Room.objects.get_or_create(
            cinema=cinema, name='Phong 2 - IMAX 3D', defaults={'room_type': RoomType.IMAX_3D, 'total_seats': 60}
        )

        # 3. Create Seats for Room 1 & 2
        for r_name in ['A', 'B', 'C', 'D', 'E']:
            for col in range(1, 11):
                seat_num = f"{r_name}{col}"
                stype = SeatType.STANDARD
                if r_name in ['C', 'D']:
                    stype = SeatType.VIP
                elif r_name == 'E':
                    stype = SeatType.SWEETBOX
                Seat.objects.get_or_create(room=room1, seat_number=seat_num, defaults={'row_name': r_name, 'col_index': col, 'seat_type': stype})
                Seat.objects.get_or_create(room=room2, seat_number=seat_num, defaults={'row_name': r_name, 'col_index': col, 'seat_type': stype})

        self.stdout.write(self.style.SUCCESS('OK: Tao Rap & Phong chieu & So do ghe'))

        # 4. Movies
        movies_data = [
            {
                'title': 'Inception 2', 'genre': 'Khoa hoc vien tuong', 'duration_mins': 148, 'rating': 9.1,
                'poster_url': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
                'director': 'Christopher Nolan', 'cast': 'Leonardo DiCaprio, Joseph Gordon-Levitt',
                'description': 'Cuoc hanh trinh vao sau trong giac mo lan thu hai voi nhung bi an sau hon, nguy hiem hon.',
                'status': MovieStatus.SHOWING
            },
            {
                'title': 'Avengers: Endgame 2', 'genre': 'Hanh dong', 'duration_mins': 185, 'rating': 8.8,
                'poster_url': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
                'director': 'Russo Brothers', 'cast': 'Robert Downey Jr, Chris Evans',
                'description': 'Nhung anh hung con lai doi mat voi hiem hoa chua tun thay.',
                'status': MovieStatus.SHOWING
            },
            {
                'title': 'Dune: Part Three', 'genre': 'Khoa hoc vien tuong', 'duration_mins': 165, 'rating': 8.5,
                'poster_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
                'director': 'Denis Villeneuve', 'cast': 'Timothee Chalamet, Zendaya',
                'description': 'Cuoc chien gia vi tai Arrakis len dinh diem.',
                'status': MovieStatus.SHOWING
            },
            {
                'title': 'Avatar 3', 'genre': 'Khoa hoc vien tuong', 'duration_mins': 200, 'rating': 8.9,
                'poster_url': 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=400&q=80',
                'director': 'James Cameron', 'cast': 'Sam Worthington, Zoe Saldana',
                'description': 'Jake Sully tiep tuc bao ve Pandora khoi loai nguoi.',
                'status': MovieStatus.UPCOMING
            }
        ]

        created_movies = []
        for mdata in movies_data:
            movie, _ = Movie.objects.get_or_create(title=mdata['title'], defaults=mdata)
            created_movies.append(movie)

        self.stdout.write(self.style.SUCCESS('OK: Tao 4 Bo Phim tieu bieu'))

        # 5. Showtimes
        now = timezone.now()
        Showtime.objects.get_or_create(
            movie=created_movies[0], room=room1,
            start_time=now + datetime.timedelta(hours=2),
            defaults={'end_time': now + datetime.timedelta(hours=4, minutes=30), 'price_standard': 100000, 'price_vip': 150000}
        )
        Showtime.objects.get_or_create(
            movie=created_movies[1], room=room2,
            start_time=now + datetime.timedelta(hours=5),
            defaults={'end_time': now + datetime.timedelta(hours=8), 'price_standard': 120000, 'price_vip': 170000}
        )

        # 6. Combos & Vouchers
        ComboFNB.objects.get_or_create(name='Combo Popcorn Single', defaults={'description': '1 Bap ngot + 1 Pepsi', 'price': 75000})
        ComboFNB.objects.get_or_create(name='Combo Doi Sweet Box', defaults={'description': '1 Bap lon + 2 Pepsi', 'price': 105000})
        
        Voucher.objects.get_or_create(
            code='WED30',
            defaults={
                'discount_percent': 30, 'max_discount_amount': 50000,
                'min_order_value': 100000, 'expiration_date': datetime.date(2025, 12, 31)
            }
        )

        self.stdout.write(self.style.SUCCESS('=== NAP DU LIEU THANH CONG ==='))
