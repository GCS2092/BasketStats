import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdatePhotoDto {
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

