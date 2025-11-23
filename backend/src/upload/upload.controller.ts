import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  
  constructor(private uploadService: UploadService) {}

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    this.logger.log(`🎬 [UPLOAD] Tentative d'upload vidéo`);
    this.logger.log(`   - User ID: ${req.user?.id || 'N/A'}`);
    this.logger.log(`   - File: ${file ? file.originalname : 'Aucun fichier'}`);
    this.logger.log(`   - File size: ${file ? file.size : 'N/A'} bytes`);
    this.logger.log(`   - MIME type: ${file ? file.mimetype : 'N/A'}`);

    if (!file) {
      this.logger.error(`❌ [UPLOAD] Aucun fichier fourni pour l'upload vidéo`);
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      this.uploadService.validateVideoFile(file);
      this.logger.log(`✅ [UPLOAD] Validation vidéo réussie`);

      const relativePath = `/uploads/videos/${file.filename}`;
      const fullUrl = this.uploadService.getFileUrl(relativePath);

      this.logger.log(`✅ [UPLOAD] Vidéo uploadée avec succès`);
      this.logger.log(`   - Nom: ${file.filename}`);
      this.logger.log(`   - Chemin: ${relativePath}`);
      this.logger.log(`   - URL: ${fullUrl}`);

      return {
        fileName: file.filename,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        thumbnailUrl: null, // Pas de thumbnail pour l'instant
        url: fullUrl,
      };
    } catch (error) {
      this.logger.error(`❌ [UPLOAD] Erreur lors de l'upload vidéo:`, error.message);
      throw error;
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    this.logger.log(`🖼️ [UPLOAD] Tentative d'upload image`);
    this.logger.log(`   - User ID: ${req.user?.id || 'N/A'}`);
    this.logger.log(`   - File: ${file ? file.originalname : 'Aucun fichier'}`);
    this.logger.log(`   - File size: ${file ? file.size : 'N/A'} bytes`);
    this.logger.log(`   - MIME type: ${file ? file.mimetype : 'N/A'}`);

    if (!file) {
      this.logger.error(`❌ [UPLOAD] Aucun fichier fourni pour l'upload image`);
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      this.uploadService.validateImageFile(file);
      this.logger.log(`✅ [UPLOAD] Validation image réussie`);

      const relativePath = `/uploads/images/${file.filename}`;
      const fullUrl = this.uploadService.getFileUrl(relativePath);

      this.logger.log(`✅ [UPLOAD] Image uploadée avec succès`);
      this.logger.log(`   - Nom: ${file.filename}`);
      this.logger.log(`   - Chemin: ${relativePath}`);
      this.logger.log(`   - URL: ${fullUrl}`);

      return {
        fileName: file.filename,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        url: fullUrl,
      };
    } catch (error) {
      this.logger.error(`❌ [UPLOAD] Erreur lors de l'upload image:`, error.message);
      throw error;
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    this.logger.log(`👤 [UPLOAD] Tentative d'upload avatar`);
    this.logger.log(`   - User ID: ${req.user?.id || 'N/A'}`);
    this.logger.log(`   - File: ${file ? file.originalname : 'Aucun fichier'}`);
    this.logger.log(`   - File size: ${file ? file.size : 'N/A'} bytes`);
    this.logger.log(`   - MIME type: ${file ? file.mimetype : 'N/A'}`);

    if (!file) {
      this.logger.error(`❌ [UPLOAD] Aucun fichier fourni pour l'upload avatar`);
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      this.uploadService.validateImageFile(file);
      this.logger.log(`✅ [UPLOAD] Validation avatar réussie`);

      const relativePath = `/uploads/avatars/${file.filename}`;
      const fullUrl = this.uploadService.getFileUrl(relativePath);

      this.logger.log(`✅ [UPLOAD] Avatar uploadé avec succès`);
      this.logger.log(`   - Nom: ${file.filename}`);
      this.logger.log(`   - Chemin: ${relativePath}`);
      this.logger.log(`   - URL: ${fullUrl}`);

      return {
        fileName: file.filename,
        filePath: relativePath,
        url: fullUrl,
      };
    } catch (error) {
      this.logger.error(`❌ [UPLOAD] Erreur lors de l'upload avatar:`, error.message);
      throw error;
    }
  }
}

