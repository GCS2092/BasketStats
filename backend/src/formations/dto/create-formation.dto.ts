import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class CreateFormationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  // Positions sur le terrain
  @IsOptional()
  @IsUUID()
  pointGuard?: string; // PG

  @IsOptional()
  @IsUUID()
  shootingGuard?: string; // SG

  @IsOptional()
  @IsUUID()
  smallForward?: string; // SF

  @IsOptional()
  @IsUUID()
  powerForward?: string; // PF

  @IsOptional()
  @IsUUID()
  center?: string; // C

  // Bench (remplaçants)
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  bench?: string[];
}

export class CreateLineupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  formationId?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  players: string[];

  @IsOptional()
  @IsString()
  gameType?: string;

  @IsOptional()
  @IsString()
  opponent?: string;

  @IsOptional()
  gameDate?: Date;
}
