import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsUrl, IsEmail, Min } from 'class-validator';

export class CreateClubDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  league?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  arena?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  arenaCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(1800)
  founded?: number;

  @IsOptional()
  @IsArray()
  colors?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  recruiterId?: string;
}

