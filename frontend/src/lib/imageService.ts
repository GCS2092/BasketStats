/**
 * Service pour gérer les URLs d'images de façon dynamique
 * Gère automatiquement les changements de réseau et les différentes configurations
 */

class ImageService {
  private baseUrl: string;
  private fallbackUrls: string[];

  constructor() {
    // URL de base pour l'API
    this.baseUrl = this.getBaseUrl();
    this.fallbackUrls = this.getFallbackUrls();
  }

  /**
   * Obtient l'URL de base de l'API
   */
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // En client, utiliser l'URL actuelle
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = hostname === 'localhost' ? ':3001' : '';
      return `${protocol}//${hostname}${port}`;
    }
    
    // En serveur, utiliser les variables d'environnement
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
  }

  /**
   * Obtient les URLs de fallback pour différentes configurations réseau
   */
  private getFallbackUrls(): string[] {
    const baseUrls = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://0.0.0.0:3001',
    ];

    if (typeof window !== 'undefined') {
      // Ajouter l'URL actuelle du navigateur
      const currentUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
      if (!baseUrls.includes(currentUrl)) {
        baseUrls.unshift(currentUrl);
      }
    }

    return baseUrls;
  }

  /**
   * Normalise une URL d'image
   */
  normalizeImageUrl(imagePath: string): string {
    if (!imagePath) return '/icons/icon-192x192.png';

    // Si c'est une URL complète (http/https), la retourner telle quelle
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Si c'est une URL relative qui commence par /, la retourner telle quelle
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // Construire l'URL complète avec la base actuelle
    return `${this.baseUrl}/${imagePath}`;
  }

  /**
   * Obtient toutes les variantes possibles d'une URL d'image
   */
  getImageVariants(imagePath: string): string[] {
    if (!imagePath) return ['/icons/icon-192x192.png'];

    const variants: string[] = [];

    // URL originale
    variants.push(imagePath);

    // URL normalisée
    variants.push(this.normalizeImageUrl(imagePath));

    // URLs avec différents hosts
    this.fallbackUrls.forEach(baseUrl => {
      variants.push(`${baseUrl}/${imagePath}`);
    });

    // URL relative
    if (!imagePath.startsWith('/')) {
      variants.push(`/${imagePath}`);
    }

    // Supprimer les doublons
    return [...new Set(variants)];
  }

  /**
   * Teste si une URL d'image est accessible
   */
  async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trouve la première URL d'image accessible
   */
  async findWorkingImageUrl(imagePath: string): Promise<string> {
    const variants = this.getImageVariants(imagePath);
    
    for (const variant of variants) {
      if (await this.testImageUrl(variant)) {
        return variant;
      }
    }

    // Si aucune URL ne fonctionne, retourner le fallback
    return '/icons/icon-192x192.png';
  }

  /**
   * Met à jour l'URL de base (utile lors des changements de réseau)
   */
  updateBaseUrl(): void {
    this.baseUrl = this.getBaseUrl();
  }
}

// Instance singleton
export const imageService = new ImageService();

// Hook pour utiliser le service dans les composants React
export function useImageService() {
  return imageService;
}
