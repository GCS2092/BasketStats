import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateBlockDto {
  @IsUUID()
  blockedId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

