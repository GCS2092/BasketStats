import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsArray,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Position, DominantHand, PlayerLevel, Availability, Visibility } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePlayerProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsInt()
  @Min(140)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(200)
  weightKg?: number;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsEnum(Position)
  secondaryPos?: Position;

  @IsOptional()
  @IsEnum(DominantHand)
  dominantHand?: DominantHand;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  currentClub?: string;

  @IsOptional()
  @IsEnum(PlayerLevel)
  level?: PlayerLevel;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  stats?: any;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  jerseyNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @IsOptional()
  @IsEnum(Visibility)
  privacyLevel?: Visibility;

  @IsOptional()
  @IsBoolean()
  showContact?: boolean;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Le lien CV doit être une URL valide' })
  cvLink?: string;

  // Nouvelles propriétés pour correspondre au frontend
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  birthPlace?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(300)
  wingspan?: number;

  @IsOptional()
  @IsString()
  sportingBackground?: string;
}

