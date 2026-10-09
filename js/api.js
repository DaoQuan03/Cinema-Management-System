/* ════════════════════════════════════════════════════
   CinéLux — api.js
   Service kết nối API Backend Django (REST API + Realtime)
   ════════════════════════════════════════════════════ */

const API_BASE = 'http://127.0.0.1:8000/api';

const api = {
  // Helper thực hiện HTTP request
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('cinelux_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Lỗi API (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API] Gọi ${endpoint} thất bại:`, err.message);
      // Ném lỗi để component/controller xử lý hoặc dùng fallback khi BE chưa online
      throw err;
    }
  },

  // ─── AUTH ───
  auth: {
    async login(email, password) {
      return api.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    async register(data) {
      return api.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async getCurrentUser() {
      return api.request('/auth/me/');
    }
  },

  // ─── MOVIES ───
  movies: {
    async getAll() {
      return api.request('/movies/');
    },
    async getById(id) {
      return api.request(`/movies/${id}/`);
    },
    async create(data) {
      return api.request('/movies/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    async delete(id) {
      return api.request(`/movies/${id}/`, {
        method: 'DELETE'
      });
    }
  },

  // ─── ROOMS ───
  rooms: {
    async getAll() {
      return api.request('/rooms/');
    },
    async create(data) {
      return api.request('/rooms/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // ─── SHOWTIMES ───
  showtimes: {
    async getAll(date) {
      const q = date ? `?date=${encodeURIComponent(date)}` : '';
      return api.request(`/showtimes/${q}`);
    },
    async getByMovie(movieId) {
      return api.request(`/showtimes/?movie_id=${movieId}`);
    },
    async create(data) {
      return api.request('/showtimes/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // ─── BOOKING & TICKETS ───
  booking: {
    async getBookedSeats(showtimeId) {
      return api.request(`/showtimes/${showtimeId}/seats/`);
    },
    async createTicket(ticketData) {
      return api.request('/tickets/', {
        method: 'POST',
        body: JSON.stringify(ticketData)
      });
    }
  },

  tickets: {
    async getAll() {
      return api.request('/tickets/');
    },
    async getMyTickets() {
      return api.request('/tickets/my-tickets/');
    },
    async cancelTicket(id) {
      return api.request(`/tickets/${id}/cancel/`, { method: 'POST' });
    }
  },

  // ─── REVIEWS ───
  reviews: {
    async getAll() {
      return api.request('/reviews/');
    },
    async create(data) {
      return api.request('/reviews/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // ─── DASHBOARD & REPORTS ───
  dashboard: {
    async getStats() {
      return api.request('/dashboard/stats/');
    },
    async getRevenueReport(month) {
      const q = month ? `?month=${encodeURIComponent(month)}` : '';
      return api.request(`/reports/revenue/${q}`);
    }
  },

  // ─── USERS ───
  users: {
    async getAll() {
      return api.request('/users/');
    },
    async create(data) {
      return api.request('/users/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  }
};
