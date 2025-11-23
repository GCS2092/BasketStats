import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePlayerProfileDto, UpdatePlayerProfileDto, SearchPlayersDto } from './dto';

@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async createProfile(@GetUser('id') userId: string, @Body() dto: CreatePlayerProfileDto) {
    return this.playersService.createProfile(userId, dto);
  }

  @Put(':userId/profile')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async updateProfile(
    @Param('userId') userId: string,
    @GetUser('id') currentUserId: string,
    @Body() dto: UpdatePlayerProfileDto,
  ) {
    return this.playersService.updateProfile(userId, currentUserId, dto);
  }

  @Get(':userId/profile')
  async getProfile(@Param('userId') userId: string) {
    return this.playersService.getProfile(userId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async searchPlayers(@Query() dto: SearchPlayersDto) {
    return this.playersService.searchPlayers(dto);
  }

  @Get('top')
  async getTopPlayers(@Query('limit') limit?: number) {
    return this.playersService.getTopPlayers(limit);
  }

  @Get('suggested/:userId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getSuggestedPlayers(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.playersService.getSuggestedPlayers(userId, limit);
  }

  // Recherches sauvegardées (recruteur)
  @Post('saved-searches')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async saveSearch(@GetUser('id') userId: string, @Body() data: { name: string; filters: any }) {
    return this.playersService.saveSearch(userId, data);
  }

  @Get('saved-searches')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getSavedSearches(@GetUser('id') userId: string) {
    return this.playersService.getSavedSearches(userId);
  }

  @Delete('saved-searches/:id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async deleteSavedSearch(@Param('id') id: string) {
    return this.playersService.deleteSavedSearch(id);
  }

  // === HISTORIQUE CARRIÈRE ===

  @Get(':playerId/career-history')
  async getCareerHistory(@Param('playerId') playerId: string) {
    return this.playersService.getCareerHistory(playerId);
  }

  @Post(':playerId/career-history')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async addCareerHistory(@Param('playerId') playerId: string, @Body() data: any) {
    return this.playersService.addCareerHistory(playerId, data);
  }

  @Put('career-history/:id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async updateCareerHistory(@Param('id') id: string, @Body() data: any) {
    return this.playersService.updateCareerHistory(id, data);
  }

  @Delete('career-history/:id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async deleteCareerHistory(@Param('id') id: string) {
    return this.playersService.deleteCareerHistory(id);
  }
}

