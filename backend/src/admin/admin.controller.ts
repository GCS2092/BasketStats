import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard - Statistiques générales
  @Get('dashboard')
  async getDashboardStats(@GetUser('id') adminId: string) {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard-stats')
  async getDashboardStatsAlt(@GetUser('id') adminId: string) {
    return this.adminService.getDashboardStats();
  }

  // Gestion des utilisateurs
  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('verified') verified?: string,
  ) {
    return this.adminService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Put('users/:id/verify')
  async verifyUser(@Param('id') userId: string, @Body() body: { verified: boolean }) {
    return this.adminService.verifyUser(userId, body.verified);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') userId: string, @Body() body: { role: UserRole }) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Put('users/:id/active')
  async toggleUserActive(
    @Param('id') userId: string,
    @Body() body: { active: boolean },
  ) {
    return this.adminService.toggleUserActive(userId, body.active);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Gestion des posts
  @Get('posts')
  async getPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    return this.adminService.getPosts({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
  }

  @Put('posts/:id/moderate')
  async moderatePost(@Param('id') postId: string, @Body() body: { action: 'APPROVE' | 'REJECT'; reason?: string }) {
    return this.adminService.moderatePost(postId, body.action, body.reason);
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') postId: string) {
    return this.adminService.deletePost(postId);
  }

  // Gestion des signalements
  @Get('reports')
  async getReports(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    return this.adminService.getReports({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
  }

  @Put('reports/:id/resolve')
  async resolveReport(@Param('id') reportId: string, @Body() body: { action: string; reason?: string }) {
    return this.adminService.resolveReport(reportId, body.action, body.reason);
  }

  // Statistiques détaillées
  @Get('stats/users')
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/posts')
  async getPostStats() {
    return this.adminService.getPostStats();
  }

  @Get('stats/activity')
  async getActivityStats(@Query('days') days: string = '30') {
    return this.adminService.getActivityStats(parseInt(days));
  }

  // Gestion des clubs
  @Get('clubs')
  async getClubs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('verified') verified?: string,
  ) {
    return this.adminService.getClubs({
      page: parseInt(page),
      limit: parseInt(limit),
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    });
  }

  @Put('clubs/:id/verify')
  async verifyClub(@Param('id') clubId: string, @Body() body: { verified: boolean }) {
    return this.adminService.verifyClub(clubId, body.verified);
  }

  // Gestion des événements
  @Get('events')
  async getEvents(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    return this.adminService.getEvents({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
  }

  @Put('events/:id/feature')
  async featureEvent(@Param('id') eventId: string, @Body() body: { featured: boolean }) {
    return this.adminService.featureEvent(eventId, body.featured);
  }

  // Logs système
  @Get('logs')
  async getSystemLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('level') level?: string,
  ) {
    return this.adminService.getSystemLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      level,
    });
  }

  // Gestion des abonnements
  @Get('subscriptions/plans')
  async getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Get('subscriptions/plans/:planId/users')
  async getPlanUsers(
    @Param('planId') planId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPlanUsers(planId, parseInt(page), parseInt(limit));
  }

  @Get('subscriptions/stats')
  async getSubscriptionStats() {
    return this.adminService.getSubscriptionStats();
  }
}
