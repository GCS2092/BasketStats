import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || 'uploads';

  async generateThumbnail(videoPath: string): Promise<string | null> {
    // Thumbnail generation désactivé temporairement (sharp pose problème)
    // TODO: Implémenter avec ffmpeg ou autre solution
    this.logger.log(`Thumbnail placeholder pour: ${videoPath}`);
    return null;
  }

  async processImage(imagePath: string, options?: { width?: number; height?: number }): Promise<string> {
    // Image processing désactivé (sharp pose problème)
    // On retourne juste le chemin original sans traitement
    this.logger.log(`Image stockée sans traitement: ${imagePath}`);
    // Ne PAS essayer de lire le fichier, juste retourner le path
    return imagePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath);
        this.logger.log(`Fichier supprimé: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Erreur suppression fichier: ${error.message}`);
    }
  }

  validateVideoFile(file: Express.Multer.File): void {
    const allowedFormats = (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,webm,mov,avi').split(',');
    const ext = path.extname(file.originalname).slice(1).toLowerCase();

    if (!allowedFormats.includes(ext)) {
      throw new BadRequestException(
        `Format vidéo non autorisé. Formats acceptés: ${allowedFormats.join(', ')}`,
      );
    }
  }

  validateImageFile(file: Express.Multer.File): void {
    this.logger.log(`🔍 [UPLOAD] Validation du fichier image`);
    this.logger.log(`   - Nom original: ${file.originalname}`);
    this.logger.log(`   - Taille: ${file.size} bytes`);
    this.logger.log(`   - MIME type: ${file.mimetype}`);
    
    const allowedFormats = (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,webp,gif').split(',');
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    
    this.logger.log(`   - Extension détectée: ${ext}`);
    this.logger.log(`   - Formats autorisés: ${allowedFormats.join(', ')}`);

    if (!allowedFormats.includes(ext)) {
      this.logger.error(`❌ [UPLOAD] Format image non autorisé: ${ext}`);
      throw new BadRequestException(
        `Format image non autorisé. Formats acceptés: ${allowedFormats.join(', ')}`,
      );
    }
    
    this.logger.log(`✅ [UPLOAD] Format image valide`);
  }

  getFileUrl(filePath: string): string {
    const backendUrl = process.env.BACKEND_URL || 'http://192.168.1.118:3001';
    const fullUrl = `${backendUrl}${filePath}`;
    
    this.logger.log(`🔗 [UPLOAD] Génération URL fichier`);
    this.logger.log(`   - Chemin: ${filePath}`);
    this.logger.log(`   - Backend URL: ${backendUrl}`);
    this.logger.log(`   - URL complète: ${fullUrl}`);
    
    return fullUrl;
  }
}
