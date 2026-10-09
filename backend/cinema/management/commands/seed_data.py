from django.core.management.base import BaseCommand
from cinema.models import User, Movie, Room, Showtime, Ticket, BookedSeat, Review

class Command(BaseCommand):
    help = 'Nạp dữ liệu khởi tạo cho hệ thống rạp chiếu phim CinéLux'

    def handle(self, *args, **kwargs):
        self.stdout.write("[Seed] Seeding user accounts...")
        users_data = [
            {'email': 'admin@cinelux.vn', 'password': 'admin123', 'name': 'Admin CinéLux', 'role': 'Admin', 'phone': '0901 000 000'},
            {'email': 'staff@cinelux.vn', 'password': 'staff123', 'name': 'Nguyễn Thị Lan', 'role': 'Staff', 'phone': '0901 234 567'},
            {'email': 'lan@cinelux.vn', 'password': 'staff123', 'name': 'Nguyễn Thị Lan', 'role': 'Staff', 'phone': '0901 234 567'},
            {'email': 'user@cinelux.vn', 'password': 'user123', 'name': 'Trần Văn Toàn', 'role': 'User', 'phone': '0908 999 888'},
            {'email': 'toan@gmail.com', 'password': 'user123', 'name': 'Trần Văn Toàn', 'role': 'User', 'phone': '0908 999 888'},
            {'email': 'user1@cinelux.vn', 'password': 'user123', 'name': 'Hoàng Văn Nam', 'role': 'User', 'phone': '0912 345 678'},
            {'email': 'user2@cinelux.vn', 'password': 'user123', 'name': 'Lê Thị Mai', 'role': 'User', 'phone': '0934 567 890'},
        ]

        for u in users_data:
            if not User.objects.filter(email=u['email']).exists():
                User.objects.create_user(
                    email=u['email'],
                    password=u['password'],
                    name=u['name'],
                    role=u['role'],
                    phone=u['phone'],
                    is_staff=(u['role'] == 'Admin'),
                    is_superuser=(u['role'] == 'Admin')
                )
                self.stdout.write(f"  + User created: {u['email']} [{u['role']}]")

        self.stdout.write("[Seed] Seeding rooms...")
        rooms_data = [
            {'name': 'Phòng 1 - IMAX', 'room_type': 'IMAX', 'total_seats': 300, 'status': 'Hoạt động', 'usage_pct': 85},
            {'name': 'Phòng 2 - 4DX', 'room_type': '4DX', 'total_seats': 120, 'status': 'Hoạt động', 'usage_pct': 60},
            {'name': 'Phòng 3 - 2D', 'room_type': '2D', 'total_seats': 150, 'status': 'Bảo trì', 'usage_pct': 0},
            {'name': 'Phòng 4 - 3D', 'room_type': '3D', 'total_seats': 200, 'status': 'Hoạt động', 'usage_pct': 45},
        ]
        created_rooms = {}
        for r in rooms_data:
            room, _ = Room.objects.get_or_create(name=r['name'], defaults=r)
            created_rooms[r['name']] = room

        self.stdout.write("[Seed] Seeding movies...")
        movies_data = [
            {'title': 'Avengers: Secret Wars', 'emoji': '🦸', 'genre': 'Action', 'duration': 155, 'rating': 9.2, 'start_date': '20/02/2026', 'status': 'active', 'c1': '#1a0a2e', 'c2': '#3d1f5e'},
            {'title': 'Biển Khát', 'emoji': '🌊', 'genre': 'Thriller', 'duration': 112, 'rating': 7.8, 'start_date': '15/02/2026', 'status': 'active', 'c1': '#0a1a2e', 'c2': '#1a3a5e'},
            {'title': 'Quỷ Nhập Tràng', 'emoji': '👻', 'genre': 'Horror', 'duration': 105, 'rating': 8.1, 'start_date': '10/02/2026', 'status': 'active', 'c1': '#1a0a0a', 'c2': '#3a1a1a'},
            {'title': 'Tình Yêu Mùa Đông', 'emoji': '❤️', 'genre': 'Romantic', 'duration': 98, 'rating': 7.4, 'start_date': '01/02/2026', 'status': 'active', 'c1': '#2e0a1a', 'c2': '#5e1a3a'},
            {'title': 'Bố Già 2', 'emoji': '😂', 'genre': 'Comedy', 'duration': 118, 'rating': 8.5, 'start_date': '07/02/2026', 'status': 'active', 'c1': '#1a2e0a', 'c2': '#3a5e1a'},
            {'title': 'Interstellar 2', 'emoji': '🚀', 'genre': 'Sci-Fi', 'duration': 170, 'rating': 9.0, 'start_date': '01/03/2026', 'status': 'upcoming', 'c1': '#0a1a1a', 'c2': '#1a3a3a'},
        ]
        created_movies = {}
        for m in movies_data:
            movie, _ = Movie.objects.get_or_create(title=m['title'], defaults=m)
            created_movies[m['title']] = movie

        self.stdout.write("[Seed] Seeding showtimes...")
        showtimes_data = [
            # Avengers: Secret Wars
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '09:15'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '14:00'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '19:15'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 2 - 4DX',  'show_date': '2026-02-27', 'start_time': '21:30'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '10:00'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '15:30'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 2 - 4DX',  'show_date': '2026-02-28', 'start_time': '19:45'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 4 - 3D',   'show_date': '2026-02-28', 'start_time': '22:15'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-03-01', 'start_time': '13:00'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-03-01', 'start_time': '18:30'},
            {'movie': 'Avengers: Secret Wars', 'room': 'Phòng 2 - 4DX',  'show_date': '2026-03-01', 'start_time': '21:00'},

            # Biển Khát
            {'movie': 'Biển Khát', 'room': 'Phòng 3 - 2D', 'show_date': '2026-02-27', 'start_time': '15:00'},
            {'movie': 'Biển Khát', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-27', 'start_time': '20:00'},
            {'movie': 'Biển Khát', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-28', 'start_time': '14:15'},
            {'movie': 'Biển Khát', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-28', 'start_time': '18:45'},
            {'movie': 'Biển Khát', 'room': 'Phòng 4 - 3D', 'show_date': '2026-03-01', 'start_time': '16:30'},

            # Quỷ Nhập Tràng
            {'movie': 'Quỷ Nhập Tràng', 'room': 'Phòng 2 - 4DX', 'show_date': '2026-02-27', 'start_time': '16:15'},
            {'movie': 'Quỷ Nhập Tràng', 'room': 'Phòng 2 - 4DX', 'show_date': '2026-02-27', 'start_time': '22:45'},
            {'movie': 'Quỷ Nhập Tràng', 'room': 'Phòng 2 - 4DX', 'show_date': '2026-02-28', 'start_time': '21:00'},
            {'movie': 'Quỷ Nhập Tràng', 'room': 'Phòng 2 - 4DX', 'show_date': '2026-02-28', 'start_time': '23:15'},

            # Tình Yêu Mùa Đông
            {'movie': 'Tình Yêu Mùa Đông', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-27', 'start_time': '11:30'},
            {'movie': 'Tình Yêu Mùa Đông', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-27', 'start_time': '17:45'},
            {'movie': 'Tình Yêu Mùa Đông', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-28', 'start_time': '13:30'},
            {'movie': 'Tình Yêu Mùa Đông', 'room': 'Phòng 4 - 3D', 'show_date': '2026-02-28', 'start_time': '19:00'},

            # Bố Già 2
            {'movie': 'Bố Già 2', 'room': 'Phòng 4 - 3D',   'show_date': '2026-02-27', 'start_time': '10:30'},
            {'movie': 'Bố Già 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '18:00'},
            {'movie': 'Bố Già 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '11:00'},
            {'movie': 'Bố Già 2', 'room': 'Phòng 2 - 4DX',  'show_date': '2026-02-28', 'start_time': '16:00'},
            {'movie': 'Bố Già 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '20:15'},

            # Interstellar 2
            {'movie': 'Interstellar 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '13:45'},
            {'movie': 'Interstellar 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-27', 'start_time': '20:30'},
            {'movie': 'Interstellar 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '14:00'},
            {'movie': 'Interstellar 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-02-28', 'start_time': '21:15'},
            {'movie': 'Interstellar 2', 'room': 'Phòng 1 - IMAX', 'show_date': '2026-03-01', 'start_time': '19:15'},
        ]
        created_showtimes = []
        for s in showtimes_data:
            st, _ = Showtime.objects.get_or_create(
                movie=created_movies[s['movie']],
                room=created_rooms[s['room']],
                show_date=s['show_date'],
                start_time=s['start_time']
            )
            created_showtimes.append(st)

        self.stdout.write("[Seed] Seeding tickets...")
        tickets_data = [
            {'ticket_code': 'TK-2026-8812', 'customer': 'Trần Văn Toàn', 'movie': 'Avengers: Secret Wars', 'room': 'Phòng 1 - IMAX', 'time': '19:15', 'seats': 'E5, E6', 'total': '260.000đ', 'total_amount': 260000, 'status': 'active'},
            {'ticket_code': 'TK-2026-8811', 'customer': 'Lê Hoàng Nam', 'movie': 'Biển Khát', 'room': 'Phòng 3 - 2D', 'time': '15:00', 'seats': 'C4, C5', 'total': '180.000đ', 'total_amount': 180000, 'status': 'used'},
            {'ticket_code': 'TK-2026-8810', 'customer': 'Phạm Thu Trang', 'movie': 'Quỷ Nhập Tràng', 'room': 'Phòng 2 - 4DX', 'time': '16:15', 'seats': 'D7', 'total': '130.000đ', 'total_amount': 130000, 'status': 'active'},
        ]
        for t in tickets_data:
            Ticket.objects.get_or_create(
                ticket_code=t['ticket_code'],
                defaults=t
            )

        self.stdout.write("[Seed] Seeding reviews...")
        reviews_data = [
            {'movie_title': 'Avengers: Secret Wars', 'user': 'Đặng Minh Khang', 'role': 'Khách hàng VIP', 'stars': 5, 'text': 'Phòng IMAX chất lượng tuyệt hảo, âm thanh vòm sống động như đang ở trong phim!'},
            {'movie_title': 'Quỷ Nhập Tràng', 'user': 'Hoàng Mỹ Duyên', 'role': 'Thành viên Gold', 'stars': 4, 'text': 'Phim kinh dị nội dung cuốn hút, không khí rạp tạo cảm giác hồi hộp tột đỉnh.'},
        ]
        for rev in reviews_data:
            Review.objects.get_or_create(
                movie_title=rev['movie_title'],
                user=rev['user'],
                defaults=rev
            )

        self.stdout.write("[Seed] Seeding completed successfully!")
