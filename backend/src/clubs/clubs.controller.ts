import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubMembersService } from './club-members.service';
import { TeamsService } from './teams.service';
import { CreateClubDto, UpdateClubDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ClubRole, TeamCategory, Position } from '@prisma/client';

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService,
    private readonly clubMembersService: ClubMembersService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  create(@Body() dto: CreateClubDto, @GetUser('id') userId: string) {
    return this.clubsService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async findAll(
    @Query('country') country?: string,
    @Query('league') league?: string,
    @Query('verified') verified?: string,
    @Query('status') status?: string,
  ) {
    console.log('🔍 ClubsController.findAll appelé avec:', { country, league, verified, status });
    
    try {
      const result = await this.clubsService.findAll({
        country,
        league,
        verified: verified === 'true',
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | undefined,
      });
      
      console.log('🔍 ClubsController.findAll résultat:', result.length, 'clubs');
      return result;
    } catch (error) {
      console.error('🔍 Erreur dans ClubsController.findAll:', error);
      throw error;
    }
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.clubsService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  remove(@Param('id') id: string) {
    return this.clubsService.remove(id);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  verify(@Param('id') id: string) {
    return this.clubsService.verify(id);
  }

  // ===== ENDPOINTS ADMIN POUR L'APPROBATION DES CLUBS =====

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.clubsService.findPending();
  }

  @Get('admin/status/:status')
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findByStatus(@Param('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    return this.clubsService.findByStatus(status);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string, @GetUser('id') adminId: string) {
    return this.clubsService.approve(id, adminId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @GetUser('id') adminId: string, @Body() body: { reason?: string }) {
    return this.clubsService.reject(id, adminId, body.reason);
  }

  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  suspend(@Param('id') id: string, @GetUser('id') adminId: string) {
    return this.clubsService.suspend(id, adminId);
  }

  // ===== ENDPOINTS POUR LA GESTION DES MEMBRES =====

  @Get(':id/members')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getClubMembers(@Param('id') clubId: string, @GetUser('id') userId: string) {
    return this.clubMembersService.getClubMembers(clubId, userId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  addMember(
    @Param('id') clubId: string,
    @Body() body: { userId: string; role: ClubRole },
    @GetUser('id') requesterId: string,
  ) {
    return this.clubMembersService.addMember(clubId, body.userId, body.role, requesterId);
  }

  @Put(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  updateMemberRole(
    @Param('id') clubId: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: ClubRole },
    @GetUser('id') requesterId: string,
  ) {
    return this.clubMembersService.updateMemberRole(clubId, memberId, body.role, requesterId);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  removeMember(
    @Param('id') clubId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') requesterId: string,
  ) {
    return this.clubMembersService.removeMember(clubId, memberId, requesterId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  requestToJoin(
    @Param('id') clubId: string,
    @Body() body: { role?: ClubRole },
    @GetUser('id') userId: string,
  ) {
    return this.clubMembersService.requestToJoin(clubId, userId, body.role || 'PLAYER');
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getClubStats(@Param('id') clubId: string) {
    return this.clubMembersService.getClubStats(clubId);
  }

  // ===== ENDPOINTS POUR LES UTILISATEURS =====

  @Get('user/memberships')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getUserClubs(@GetUser('id') userId: string) {
    return this.clubMembersService.getUserClubs(userId);
  }

  // ===== ENDPOINTS POUR LA GESTION DES ÉQUIPES =====

  @Get(':id/teams')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getClubTeams(@Param('id') clubId: string, @Query('season') season?: string) {
    return this.teamsService.getClubTeams(clubId, season);
  }

  @Post(':id/teams')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  createTeam(
    @Param('id') clubId: string,
    @Body() body: {
      name: string;
      category: TeamCategory;
      season: string;
      headCoachId?: string;
      description?: string;
    },
    @GetUser('id') requesterId: string,
  ) {
    return this.teamsService.createTeam(clubId, body, requesterId);
  }

  @Get('teams/:teamId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getTeam(@Param('teamId') teamId: string) {
    return this.teamsService.getTeam(teamId);
  }

  @Put('teams/:teamId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  updateTeam(
    @Param('teamId') teamId: string,
    @Body() body: {
      name?: string;
      category?: TeamCategory;
      season?: string;
      headCoachId?: string;
      description?: string;
      active?: boolean;
    },
    @GetUser('id') requesterId: string,
  ) {
    return this.teamsService.updateTeam(teamId, body, requesterId);
  }

  @Delete('teams/:teamId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  deleteTeam(@Param('teamId') teamId: string, @GetUser('id') requesterId: string) {
    return this.teamsService.deleteTeam(teamId, requesterId);
  }

  @Post('teams/:teamId/players')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  addPlayerToTeam(
    @Param('teamId') teamId: string,
    @Body() body: {
      playerId: string;
      jerseyNumber?: number;
      position?: Position;
      isCaptain?: boolean;
      isStarter?: boolean;
    },
    @GetUser('id') requesterId: string,
  ) {
    return this.teamsService.addPlayerToTeam(teamId, body, requesterId);
  }

  @Put('teams/players/:teamPlayerId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  updateTeamPlayer(
    @Param('teamPlayerId') teamPlayerId: string,
    @Body() body: {
      jerseyNumber?: number;
      position?: Position;
      isCaptain?: boolean;
      isStarter?: boolean;
    },
    @GetUser('id') requesterId: string,
  ) {
    return this.teamsService.updateTeamPlayer(teamPlayerId, body, requesterId);
  }

  @Delete('teams/players/:teamPlayerId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  removePlayerFromTeam(@Param('teamPlayerId') teamPlayerId: string, @GetUser('id') requesterId: string) {
    return this.teamsService.removePlayerFromTeam(teamPlayerId, requesterId);
  }

  @Get('teams/:teamId/stats')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getTeamStats(@Param('teamId') teamId: string) {
    return this.teamsService.getTeamStats(teamId);
  }

  @Get('user/teams')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getUserTeams(@GetUser('id') userId: string) {
    return this.teamsService.getUserTeams(userId);
  }
}

