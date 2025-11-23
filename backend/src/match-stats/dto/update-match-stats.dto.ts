import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchStatsDto } from './create-match-stats.dto';

export class UpdateMatchStatsDto extends PartialType(CreateMatchStatsDto) {}

