import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus, Position } from '@prisma/client';

export class UpdateClubApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  response?: string;
}
