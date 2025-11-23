import { IsString, IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateMatchStatsDto {
  @IsString()
  playerId: string;

  @IsDateString()
  matchDate: string;

  @IsString()
  opponent: string;

  @IsOptional()
  @IsString()
  homeAway?: 'HOME' | 'AWAY';

  @IsOptional()
  @IsString()
  result?: 'WIN' | 'LOSS';

  @IsOptional()
  @IsString()
  score?: string;

  // Stats offensives
  @IsInt()
  @Min(0)
  points: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fieldGoalsMade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fieldGoalsAttempted?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  threePointersMade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  threePointersAttempted?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  freeThrowsMade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  freeThrowsAttempted?: number;

  // Stats défensives
  @IsOptional()
  @IsInt()
  @Min(0)
  rebounds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offensiveRebounds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defensiveRebounds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  assists?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  steals?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  blocks?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  turnovers?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fouls?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(48)
  minutesPlayed?: number;

  @IsOptional()
  @IsString()
  performance?: string;

  @IsOptional()
  highlights?: string[];
}

