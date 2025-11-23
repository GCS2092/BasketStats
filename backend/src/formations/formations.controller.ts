import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateFormationDto, CreateLineupDto, UpdateFormationDto, UpdateLineupDto } from './dto';

@Controller('formations')
export class FormationsController {
  constructor(private formationsService: FormationsService) {}

  // === FORMATIONS ===

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFormation(@GetUser('id') recruiterId: string, @Body() dto: CreateFormationDto) {
    return this.formationsService.createFormation(recruiterId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFormations(@GetUser('id') recruiterId: string) {
    return this.formationsService.getFormations(recruiterId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFormation(@Param('id') id: string, @GetUser('id') recruiterId: string) {
    return this.formationsService.getFormation(id, recruiterId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFormation(
    @Param('id') id: string,
    @GetUser('id') recruiterId: string,
    @Body() dto: UpdateFormationDto,
  ) {
    return this.formationsService.updateFormation(id, recruiterId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFormation(@Param('id') id: string, @GetUser('id') recruiterId: string) {
    return this.formationsService.deleteFormation(id, recruiterId);
  }

  // === LIGNEUPS ===

  @Post('lineups')
  @UseGuards(JwtAuthGuard)
  async createLineup(@GetUser('id') recruiterId: string, @Body() dto: CreateLineupDto) {
    return this.formationsService.createLineup(recruiterId, dto);
  }

  @Get('lineups')
  @UseGuards(JwtAuthGuard)
  async getLineups(@GetUser('id') recruiterId: string) {
    return this.formationsService.getLineups(recruiterId);
  }

  @Get('lineups/:id')
  @UseGuards(JwtAuthGuard)
  async getLineup(@Param('id') id: string, @GetUser('id') recruiterId: string) {
    return this.formationsService.getLineup(id, recruiterId);
  }

  @Put('lineups/:id')
  @UseGuards(JwtAuthGuard)
  async updateLineup(
    @Param('id') id: string,
    @GetUser('id') recruiterId: string,
    @Body() dto: UpdateLineupDto,
  ) {
    return this.formationsService.updateLineup(id, recruiterId, dto);
  }

  @Delete('lineups/:id')
  @UseGuards(JwtAuthGuard)
  async deleteLineup(@Param('id') id: string, @GetUser('id') recruiterId: string) {
    return this.formationsService.deleteLineup(id, recruiterId);
  }

  // === ANALYTICS & UTILS ===

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  async getFormationStats(@GetUser('id') recruiterId: string) {
    return this.formationsService.getFormationStats(recruiterId);
  }

  @Get('players/available')
  @UseGuards(JwtAuthGuard)
  async getAvailablePlayers(@GetUser('id') recruiterId: string) {
    return this.formationsService.getAvailablePlayers(recruiterId);
  }
}
