/* ============================================================
   API.JS — Central API Client for Django REST Framework Backend
   ============================================================ */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiClient {
  static getAuthToken() {
    return localStorage.getItem('cineverse_auth_token') || null;
  }

  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('cineverse_auth_token', token);
    } else {
      localStorage.removeItem('cineverse_auth_token');
    }
  }

  static getHeaders(extraHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extraHeaders,
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {}),
    };

    try {
      const response = await fetch(url, config);
      if (response.status === 401) {
        // Token expired or invalid
        this.setAuthToken(null);
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Có lỗi xảy ra từ máy chủ');
      }
      return data;
    } catch (err) {
      console.warn(`[API Client] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  /* ── Auth API Calls ─────────────────────────────────────── */
  static async login(email, password) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getProfile() {
    return this.request('/auth/profile/');
  }

  static async updateProfile(profileData) {
    return this.request('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /* ── Cinema & Movie API Calls ───────────────────────────── */
  static async getCinemas() {
    return this.request('/cinemas/');
  }

  static async getMovies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/movies/${query ? '?' + query : ''}`);
  }

  static async getMovieById(id) {
    return this.request(`/movies/${id}/`);
  }

  static async getMovieReviews(id) {
    return this.request(`/movies/${id}/reviews/`);
  }

  static async postReview(movieId, rating, comment) {
    return this.request(`/movies/${movieId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  /* ── Showtimes & Seats API Calls ────────────────────────── */
  static async getShowtimes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/showtimes/${query ? '?' + query : ''}`);
  }

  static async getShowtimeSeats(showtimeId) {
    return this.request(`/showtimes/${showtimeId}/seats/`);
  }

  /* ── Combos & Vouchers API Calls ────────────────────────── */
  static async getCombos() {
    return this.request('/combos/');
  }

  static async applyVoucher(code, orderTotal) {
    return this.request('/vouchers/apply/', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    });
  }

  /* ── Bookings & POS API Calls ────────────────────────────── */
  static async createBooking(bookingData) {
    return this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  static async getMyTickets() {
    return this.request('/bookings/my-tickets/');
  }

  static async checkInTicket(ticketCode) {
    return this.request('/bookings/check-in/', {
      method: 'POST',
      body: JSON.stringify({ ticketCode }),
    });
  }

  /* ── Admin API Calls ────────────────────────────────────── */
  static async getAdminDashboardStats() {
    return this.request('/admin/reports/dashboard/');
  }

  static async createMovie(movieData) {
    return this.request('/admin/movies/', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  static async updateMovie(id, movieData) {
    return this.request(`/admin/movies/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  }

  static async deleteMovie(id) {
    return this.request(`/admin/movies/${id}/`, {
      method: 'DELETE',
    });
  }
}

window.ApiClient = ApiClient;
