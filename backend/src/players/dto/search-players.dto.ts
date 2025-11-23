import { IsOptional, IsString, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Position, PlayerLevel, Availability } from '@prisma/client';

export class SearchPlayersDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsEnum(PlayerLevel)
  level?: PlayerLevel;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minHeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxHeight?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  certified?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

