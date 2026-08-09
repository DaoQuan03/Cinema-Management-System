import asyncio
import json
import time
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Setup logging
logging.basicConfig(level=logging.INFO, format="[SocketServer] %(asctime)s - %(message)s")

ROOM_CAPACITY = 100        # Max active users per showtime session
HOLD_DURATION_SECONDS = 300 # 5 Minutes hold duration

# In-memory storage for room states
# rooms[showtime_id] = {
#     'active_users': { client_id: { 'user_id': ..., 'user_name': ..., 'connected_at': ... } },
#     'waiting_queue': [ { 'client_id': ..., 'user_id': ..., 'user_name': ... } ],
#     'seat_states': { seat_id: { 'status': 'locked'|'booked', 'locked_by': client_id, 'user_name': ..., 'expire_at': timestamp } }
# }
ROOMS = {}

def get_or_create_room(showtime_id):
    if showtime_id not in ROOMS:
        ROOMS[showtime_id] = {
            'active_users': {},
            'waiting_queue': [],
            'seat_states': {}
        }
    return ROOMS[showtime_id]

def cleanup_expired_locks(showtime_id):
    """Check and release any seats where the 5-minute hold timer has expired."""
    room = get_or_create_room(showtime_id)
    now = time.time()
    expired_seats = []
    
    for seat_id, info in list(room['seat_states'].items()):
        if info.get('status') == 'locked' and info.get('expire_at', 0) < now:
            expired_seats.append(seat_id)
            del room['seat_states'][seat_id]
            
    return expired_seats

class RealtimeHTTPHandler(BaseHTTPRequestHandler):
    """HTTP API endpoints providing socket/realtime polling state & SSE compatibility."""

    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if parsed.path == '/api/realtime/room-state':
            showtime_id = params.get('showtimeId', ['1'])[0]
            client_id = params.get('clientId', [''])[0]
            user_name = params.get('userName', ['Khách'])[0]
            user_id = params.get('userId', ['user_' + str(int(time.time()))])[0]

            room = get_or_create_room(showtime_id)
            expired = cleanup_expired_locks(showtime_id)

            # Check if user is already active
            is_active = client_id in room['active_users']
            in_queue = any(q['client_id'] == client_id for q in room['waiting_queue'])

            if not is_active and not in_queue and client_id:
                if len(room['active_users']) < ROOM_CAPACITY:
                    room['active_users'][client_id] = {
                        'user_id': user_id,
                        'user_name': user_name,
                        'last_seen': time.time()
                    }
                    is_active = True
                else:
                    room['waiting_queue'].append({
                        'client_id': client_id,
                        'user_id': user_id,
                        'user_name': user_name
                    })

            # Calculate queue position
            queue_pos = 0
            if not is_active:
                for idx, q in enumerate(room['waiting_queue']):
                    if q['client_id'] == client_id:
                        queue_pos = idx + 1
                        break

            # Calculate remaining seconds for locked seats
            now = time.time()
            seats_payload = {}
            for sid, sinfo in room['seat_states'].items():
                rem = max(0, int(sinfo['expire_at'] - now)) if sinfo['status'] == 'locked' else 0
                seats_payload[sid] = {
                    'status': sinfo['status'],
                    'lockedBy': sinfo['locked_by'],
                    'userName': sinfo['user_name'],
                    'remainingSeconds': rem
                }

            response_data = {
                'status': 'admitted' if is_active else 'queued',
                'queuePosition': queue_pos,
                'totalQueued': len(room['waiting_queue']),
                'activeViewerCount': len(room['active_users']),
                'seatStates': seats_payload,
                'expiredSeats': expired
            }

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            payload = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            payload = {}

        if parsed.path == '/api/realtime/select-seat':
            showtime_id = str(payload.get('showtimeId', '1'))
            seat_id = str(payload.get('seatId', ''))
            client_id = str(payload.get('clientId', ''))
            user_name = str(payload.get('userName', 'Khách'))

            room = get_or_create_room(showtime_id)
            cleanup_expired_locks(showtime_id)

            existing = room['seat_states'].get(seat_id)
            if existing and existing['status'] == 'booked':
                res = {'success': False, 'message': 'Ghế này đã được bán!'}
            elif existing and existing['status'] == 'locked' and existing['locked_by'] != client_id and existing['expire_at'] > time.time():
                res = {'success': False, 'message': f'Ghế {seat_id} đang được giữ bởi {existing["user_name"]}'}
            else:
                expire_at = time.time() + HOLD_DURATION_SECONDS
                room['seat_states'][seat_id] = {
                    'status': 'locked',
                    'locked_by': client_id,
                    'user_name': user_name,
                    'expire_at': expire_at
                }
                res = {
                    'success': True,
                    'seatId': seat_id,
                    'status': 'locked',
                    'lockedBy': client_id,
                    'userName': user_name,
                    'remainingSeconds': HOLD_DURATION_SECONDS
                }

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return

        elif parsed.path == '/api/realtime/deselect-seat':
            showtime_id = str(payload.get('showtimeId', '1'))
            seat_id = str(payload.get('seatId', ''))
            client_id = str(payload.get('clientId', ''))

            room = get_or_create_room(showtime_id)
            existing = room['seat_states'].get(seat_id)
            if existing and existing.get('locked_by') == client_id and existing.get('status') == 'locked':
                del room['seat_states'][seat_id]

            res = {'success': True, 'seatId': seat_id, 'status': 'available'}
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return

        elif parsed.path == '/api/realtime/confirm-payment':
            showtime_id = str(payload.get('showtimeId', '1'))
            seat_ids = payload.get('seats', [])
            client_id = str(payload.get('clientId', ''))

            room = get_or_create_room(showtime_id)
            for sid in seat_ids:
                room['seat_states'][sid] = {
                    'status': 'booked',
                    'locked_by': client_id,
                    'user_name': payload.get('userName', 'Khách'),
                    'expire_at': 0
                }

            res = {'success': True, 'bookedSeats': seat_ids}
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return

        elif parsed.path == '/api/realtime/leave-room':
            showtime_id = str(payload.get('showtimeId', '1'))
            client_id = str(payload.get('clientId', ''))

            room = get_or_create_room(showtime_id)
            if client_id in room['active_users']:
                del room['active_users'][client_id]
                
                # Release unlocked seats
                for sid, sinfo in list(room['seat_states'].items()):
                    if sinfo.get('locked_by') == client_id and sinfo.get('status') == 'locked':
                        del room['seat_states'][sid]

                # Promote from queue
                if room['waiting_queue']:
                    promoted = room['waiting_queue'].pop(0)
                    room['active_users'][promoted['client_id']] = {
                        'user_id': promoted['user_id'],
                        'user_name': promoted['user_name'],
                        'last_seen': time.time()
                    }

            res = {'success': True}
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run_server(port=4000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RealtimeHTTPHandler)
    logging.info(f"Socket & Real-Time Sync Server running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server(4000)
