import axios from 'axios';
import { getSession } from 'next-auth/react';

// Fonction pour obtenir l'URL de base de l'API
function getApiBaseUrl(): string {
  // Si défini dans les variables d'environnement, l'utiliser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En production (Vercel), utiliser l'URL de production par défaut
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Si on est sur Vercel (production)
    if (hostname.includes('vercel.app')) {
      return 'https://basketstatsbackend.onrender.com/api';
    }
    
    // Si on est sur une IP réseau (192.168.x.x, 10.x.x.x, etc.) - développement local
    if (hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
      return `http://${hostname}:3001/api`;
    }
  }
  
  // Par défaut, utiliser localhost (développement local)
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
        try {
          const session = await getSession();
          // NextAuth stocke le token dans session.accessToken ou session.user.accessToken
          token = (session as any)?.accessToken || (session as any)?.user?.accessToken || null;
          
          // Si le token est dans la session, le sauvegarder dans localStorage pour les prochaines requêtes
          if (token) {
            localStorage.setItem('accessToken', token);
          }
        } catch (error) {
          // En cas d'erreur lors de la récupération de la session (ex: JSON parse error)
          // On continue sans token plutôt que de bloquer la requête
          console.warn('⚠️ [API] Erreur lors de la récupération de la session NextAuth:', error);
          token = null;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Si pas de token, retirer l'Authorization pour éviter les erreurs
        delete config.headers.Authorization;
      }
      
      // Pour FormData, ne pas définir Content-Type - Axios le fera automatiquement
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
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

