// API client for SQLite backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class APIDatabase {
  constructor() {
    this.token = localStorage.getItem('bookreader_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bookreader_token', token);
    } else {
      localStorage.removeItem('bookreader_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // User authentication methods
  async createUser(email, password, displayName, additionalData = {}) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        displayName,
        ...additionalData
      })
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async authenticateUser(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getUserProfile(userId) {
    return await this.request('/auth/profile');
  }

  async updateUserProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Books methods
  async getBooks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.isPublic !== undefined) {
      params.append('isPublic', filters.isPublic);
    }
    if (filters.featured !== undefined) {
      params.append('featured', filters.featured);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }

    return await this.request(`/books?${params.toString()}`);
  }

  async getBook(bookId) {
    return await this.request(`/books/${bookId}`);
  }

  async createBook(bookData) {
    return await this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  }

  async updateBook(bookId, bookData) {
    return await this.request(`/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  }

  async deleteBook(bookId) {
    return await this.request(`/books/${bookId}`, {
      method: 'DELETE'
    });
  }

  // Videos methods
  async getVideos(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.isPublic !== undefined) {
      params.append('isPublic', filters.isPublic);
    }
    if (filters.featured !== undefined) {
      params.append('featured', filters.featured);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.userId) {
      params.append('userId', filters.userId);
    }

    return await this.request(`/videos?${params.toString()}`);
  }

  async getVideo(videoId) {
    return await this.request(`/videos/${videoId}`);
  }

  async createVideo(videoData) {
    return await this.request('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData)
    });
  }

  async updateVideo(videoId, videoData) {
    return await this.request(`/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(videoData)
    });
  }

  async deleteVideo(videoId) {
    return await this.request(`/videos/${videoId}`, {
      method: 'DELETE'
    });
  }

  // Categories methods
  async getCategories() {
    return await this.request('/categories');
  }

  // Orders methods
  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders(userId) {
    return await this.request('/orders');
  }

  // Password reset methods
  async createPasswordResetToken(email) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, newPassword) {
    return await this.request('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ token, newPassword })
    });
  }

  // Session management
  async validateSession(token) {
    try {
      const user = await this.request('/auth/profile');
      return user;
    } catch (error) {
      return null;
    }
  }

  async deleteSession() {
    this.setToken(null);
  }

  // Cleanup
  async cleanup() {
    // This would be handled by the server
    console.log('Cleanup completed');
  }
}

// Create singleton instance
const database = new APIDatabase();

module.exports = database;
