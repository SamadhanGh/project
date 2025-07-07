import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access forbidden');
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  // Register (USER only)
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user_data');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  },

  // Check if admin
  isAdmin: () => {
    const user = authApi.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  // Check if user
  isUser: () => {
    const user = authApi.getCurrentUser();
    return user?.role === 'USER';
  }
};

// Booking API
export const bookingApi = {
  createBooking: async (bookingData: any) => {
    const response = await api.post('/api/booking', bookingData);
    return response.data;
  }
};

// Contact API
export const contactApi = {
  submitContact: async (contactData: any) => {
    const response = await api.post('/api/contact', contactData);
    return response.data;
  }
};

export default api;