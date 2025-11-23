import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  media?: any;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

