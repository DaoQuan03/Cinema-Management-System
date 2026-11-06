import socket
import urllib.request
import json
import logging

logger = logging.getLogger(__name__)

# Đảm bảo IPv4 ưu tiên trên Windows tránh timeout kết nối CloudFront
try:
    _orig_getaddrinfo = socket.getaddrinfo
    def _ipv4_getaddrinfo(*args, **kwargs):
        res = _orig_getaddrinfo(*args, **kwargs)
        ipv4 = [r for r in res if r[0] == socket.AF_INET]
        return ipv4 if ipv4 else res
    socket.getaddrinfo = _ipv4_getaddrinfo
except Exception:
    pass

TMDB_API_KEY = "e9e9d8da18ae29fc430845952232787c"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

GENRE_MAP_VI = {
    28: "Hành động",
    12: "Phiêu lưu",
    16: "Hoạt hình",
    35: "Hài",
    80: "Tội phạm",
    99: "Phim tài liệu",
    18: "Chính kịch",
    10751: "Gia đình",
    14: "Giả tưởng",
    36: "Lịch sử",
    27: "Kinh dị",
    10402: "Âm nhạc",
    9648: "Bí ẩn",
    10749: "Lãng mạn",
    878: "Khoa học viễn tưởng",
    10770: "Phim truyền hình",
    53: "Giật gân",
    10752: "Chiến tranh",
    37: "Miền Tây"
}

def _make_tmdb_request(path, params=None):
    if params is None:
        params = {}
    params['api_key'] = TMDB_API_KEY
    if 'language' not in params:
        params['language'] = 'vi-VN'

    query_str = urllib.parse.urlencode(params)
    url = f"{TMDB_BASE_URL}{path}?{query_str}"

    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CinéLux/1.0',
        'Accept': 'application/json'
    })
    try:
        with urllib.request.urlopen(req, timeout=7) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        logger.warning(f"[TMDb Request Error] {url}: {e}")
        return None

def format_movie_data(m):
    poster_path = m.get('poster_path')
    backdrop_path = m.get('backdrop_path')
    genre_ids = m.get('genre_ids', [])
    genres = [GENRE_MAP_VI.get(gid, "Điện ảnh") for gid in genre_ids if gid in GENRE_MAP_VI]
    genre_str = ", ".join(genres[:2]) if genres else "Điện ảnh"

    # Điểm đánh giá làm tròn 1 chữ số
    rating = round(float(m.get('vote_average') or 8.0), 1)
    if rating == 0:
        rating = 8.5

    return {
        'tmdb_id': m.get('id'),
        'title': m.get('title') or m.get('original_title') or 'Phim không tên',
        'original_title': m.get('original_title') or '',
        'overview': m.get('overview') or 'Chưa có mô tả tóm tắt cho phim này.',
        'release_date': m.get('release_date') or '',
        'genre': genre_str,
        'rating': rating,
        'poster_url': f"{TMDB_IMAGE_BASE}/w500{poster_path}" if poster_path else '',
        'backdrop_url': f"{TMDB_IMAGE_BASE}/w1280{backdrop_path}" if backdrop_path else '',
    }

def search_movies(query, page=1):
    data = _make_tmdb_request("/search/movie", {'query': query, 'page': page})
    if not data or 'results' not in data:
        return []
    return [format_movie_data(m) for m in data.get('results', [])[:12]]

def get_popular_movies(page=1):
    data = _make_tmdb_request("/movie/popular", {'page': page})
    if not data or 'results' not in data:
        # Thử fallback sang /movie/now_playing
        data = _make_tmdb_request("/movie/now_playing", {'page': page})
    if not data or 'results' not in data:
        return []
    return [format_movie_data(m) for m in data.get('results', [])[:16]]

def get_movie_detail(tmdb_id):
    data = _make_tmdb_request(f"/movie/{tmdb_id}", {'append_to_response': 'videos,credits'})
    if not data:
        return None

    poster_path = data.get('poster_path')
    backdrop_path = data.get('backdrop_path')
    genres = [g['name'] for g in data.get('genres', [])]
    genre_str = ", ".join(genres[:2]) if genres else "Hành động"

    # Lấy trailer YouTube
    trailer_key = ''
    videos = data.get('videos', {}).get('results', [])
    for v in videos:
        if v.get('site') == 'YouTube' and v.get('type') in ['Trailer', 'Teaser']:
            trailer_key = v.get('key')
            break
    if not trailer_key and videos:
        trailer_key = videos[0].get('key', '')

    rating = round(float(data.get('vote_average') or 8.0), 1)
    if rating == 0:
        rating = 8.5

    runtime = data.get('runtime') or 120

    return {
        'tmdb_id': data.get('id'),
        'title': data.get('title') or data.get('original_title'),
        'original_title': data.get('original_title') or '',
        'overview': data.get('overview') or '',
        'release_date': data.get('release_date') or '',
        'genre': genre_str,
        'duration': runtime,
        'rating': rating,
        'poster_url': f"{TMDB_IMAGE_BASE}/w500{poster_path}" if poster_path else '',
        'backdrop_url': f"{TMDB_IMAGE_BASE}/w1280{backdrop_path}" if backdrop_path else '',
        'trailer_key': trailer_key,
        'status': 'active'
    }

