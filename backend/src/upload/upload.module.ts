import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR || 'uploads';
          let type = 'images'; // par défaut
          
          if (file.mimetype.startsWith('video')) {
            type = 'videos';
          } else if (file.fieldname === 'avatar') {
            type = 'avatars';
          }
          
          const fullPath = `${uploadDir}/${type}`;
          
          // Créer le dossier s'il n'existe pas
          if (!existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
            console.log(`📁 [UPLOAD] Dossier créé: ${fullPath}`);
          }
          
          console.log(`📁 [UPLOAD] Destination: ${fullPath}`);
          console.log(`📁 [UPLOAD] Type: ${type}`);
          console.log(`📁 [UPLOAD] MIME: ${file.mimetype}`);
          console.log(`📁 [UPLOAD] Field: ${file.fieldname}`);
          
          cb(null, fullPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          console.log(`📝 [UPLOAD] Nom généré: ${uniqueName}`);
          console.log(`📝 [UPLOAD] Nom original: ${file.originalname}`);
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB par défaut
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}

