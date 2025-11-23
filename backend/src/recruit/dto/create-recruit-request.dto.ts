import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateRecruitRequestDto {
  @IsUUID()
  toUserId: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

