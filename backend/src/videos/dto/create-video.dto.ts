import { IsString, IsOptional, IsEnum, IsInt, IsArray, Min } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsInt()
  @Min(0)
  fileSize: number;

  @IsString()
  mimeType: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

