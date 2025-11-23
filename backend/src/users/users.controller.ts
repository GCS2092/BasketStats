import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('recruiters')
  async getAllRecruiters(
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('organization') organization?: string,
  ) {
    return this.usersService.findAllRecruiters({ search, country, organization });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @GetUser('id') currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, currentUserId, dto);
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Param('id') followeeId: string, @GetUser('id') followerId: string) {
    return this.usersService.followUser(followerId, followeeId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Param('id') followeeId: string, @GetUser('id') followerId: string) {
    return this.usersService.unfollowUser(followerId, followeeId);
  }

  @Get(':id/is-following/:targetId')
  @UseGuards(JwtAuthGuard)
  async isFollowing(@Param('id') userId: string, @Param('targetId') targetId: string) {
    const isFollowing = await this.usersService.isFollowing(userId, targetId);
    return { isFollowing };
  }
}

