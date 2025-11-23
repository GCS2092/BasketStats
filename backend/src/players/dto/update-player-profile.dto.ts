import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerProfileDto } from './create-player-profile.dto';

export class UpdatePlayerProfileDto extends PartialType(CreatePlayerProfileDto) {}

