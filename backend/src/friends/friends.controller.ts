import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('request')
  async sendFriendRequest(@Req() req, @Body('addresseeId') addresseeId: string) {
    return this.friendsService.sendFriendRequest(req.user.id, addresseeId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('request/:id/accept')
  async acceptFriendRequest(@Req() req, @Param('id') friendshipId: string) {
    return this.friendsService.acceptFriendRequest(friendshipId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('request/:id/decline')
  async declineFriendRequest(@Req() req, @Param('id') friendshipId: string) {
    return this.friendsService.declineFriendRequest(friendshipId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeFriend(@Req() req, @Param('id') friendshipId: string) {
    return this.friendsService.removeFriend(friendshipId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFriends(@Req() req) {
    return this.friendsService.getFriends(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/received')
  async getReceivedFriendRequests(@Req() req) {
    return this.friendsService.getReceivedFriendRequests(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/sent')
  async getSentFriendRequests(@Req() req) {
    return this.friendsService.getSentFriendRequests(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:userId')
  async areFriends(@Req() req, @Param('userId') userId: string) {
    const areFriends = await this.friendsService.areFriends(req.user.id, userId);
    return { areFriends };
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Req() req, @Query('q') q: string) {
    return this.friendsService.searchUsers(q);
  }
}
