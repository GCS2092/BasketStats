import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  contentType: 'user' | 'post' | 'video' | 'comment';

  @IsUUID()
  contentId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  description?: string;
}

