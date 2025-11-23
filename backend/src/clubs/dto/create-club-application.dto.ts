import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Position } from '@prisma/client';

export class CreateClubApplicationDto {
  @IsUUID()
  clubId: string;

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
}
