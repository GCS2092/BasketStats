import { Controller, Get, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @GetUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    const notifications = await this.notificationsService.getUserNotifications(userId, unreadOnly);
    return { notifications };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('mark-all-read')
  async markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.notificationsService.deleteNotification(id, userId);
  }

  @Delete('all')
  async deleteAllNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.deleteAllNotifications(userId);
  }

  @Put(':id/hide')
  async hideNotification(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.notificationsService.hideNotification(id, userId);
  }
}

