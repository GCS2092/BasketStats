import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class UpdateFormationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  // Positions sur le terrain
  @IsOptional()
  @IsUUID()
  pointGuard?: string;

  @IsOptional()
  @IsUUID()
  shootingGuard?: string;

  @IsOptional()
  @IsUUID()
  smallForward?: string;

  @IsOptional()
  @IsUUID()
  powerForward?: string;

  @IsOptional()
  @IsUUID()
  center?: string;

  // Bench
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  bench?: string[];
}

export class UpdateLineupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  formationId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  players?: string[];

  @IsOptional()
  @IsString()
  gameType?: string;

  @IsOptional()
  @IsString()
  opponent?: string;

  @IsOptional()
  gameDate?: Date;
}
