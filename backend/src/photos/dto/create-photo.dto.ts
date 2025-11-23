import { IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreatePhotoDto {
  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsInt()
  fileSize: number;

  @IsString()
  mimeType: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

