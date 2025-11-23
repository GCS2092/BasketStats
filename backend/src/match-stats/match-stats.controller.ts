import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MatchStatsService } from './match-stats.service';
import { CreateMatchStatsDto, UpdateMatchStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('match-stats')
@UseGuards(JwtAuthGuard)
export class MatchStatsController {
  constructor(private readonly matchStatsService: MatchStatsService) {}

  @Post()
  create(@Body() dto: CreateMatchStatsDto) {
    return this.matchStatsService.create(dto);
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId') playerId: string) {
    return this.matchStatsService.findByPlayer(playerId);
  }

  @Get('player/:playerId/averages')
  getPlayerAverages(@Param('playerId') playerId: string) {
    return this.matchStatsService.getPlayerAverages(playerId);
  }

  @Get('player/:playerId/top')
  getTopMatches(@Param('playerId') playerId: string) {
    return this.matchStatsService.getTopMatches(playerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchStatsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMatchStatsDto) {
    return this.matchStatsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchStatsService.remove(id);
  }
}

