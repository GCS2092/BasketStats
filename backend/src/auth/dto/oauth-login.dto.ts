import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class OAuthLoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  provider: string; // 'google' ou 'facebook'
}

