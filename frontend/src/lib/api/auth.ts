import apiClient from './client';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role?: 'PLAYER' | 'RECRUITER';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  signup: async (data: SignupData) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

