import axios from 'axios';
import { getSession } from 'next-auth/react';

// Fonction pour obtenir l'URL de base de l'API
function getApiBaseUrl(): string {
  // Si défini dans les variables d'environnement, l'utiliser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En développement, essayer de détecter l'IP du réseau depuis le navigateur
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si on est sur une IP réseau (192.168.x.x, 10.x.x.x, etc.)
    if (hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
      return `http://${hostname}:3001/api`;
    }
  }
  
  // Par défaut, utiliser localhost
  return 'http://localhost:3001/api';
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT depuis NextAuth
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Essayer d'abord localStorage (pour compatibilité)
      let token: string | null = localStorage.getItem('accessToken');
      
      // Si pas de token dans localStorage, récupérer depuis NextAuth session
      if (!token) {
        const session = await getSession();
        token = session?.accessToken || null;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur pour gérer les erreurs et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${getApiBaseUrl()}/auth/refresh`,
            { refreshToken },
          );

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

