import { IsString, IsOptional, IsInt, IsDateString, IsArray, IsEnum, IsUrl, Min } from 'class-validator';

export class CreateEventDto {
  @IsEnum(['MATCH', 'TRYOUT', 'TRAINING_CAMP', 'SHOWCASE', 'TOURNAMENT'])
  type: 'MATCH' | 'TRYOUT' | 'TRAINING_CAMP' | 'SHOWCASE' | 'TOURNAMENT';

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  clubId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsUrl()
  registrationUrl?: string;

  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'])
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';

  @IsOptional()
  featured?: boolean;
}

