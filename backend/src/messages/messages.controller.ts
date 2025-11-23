import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('conversations')
  async createConversation(@GetUser('id') userId: string, @Body('otherUserId') otherUserId: string) {
    return this.messagesService.createConversation(userId, otherUserId);
  }

  @Get('conversations')
  async getUserConversations(@GetUser('id') userId: string) {
    return this.messagesService.getUserConversations(userId);
  }

  @Get('conversations/:id/messages')
  async getConversationMessages(@Param('id') conversationId: string) {
    return this.messagesService.getConversationMessages(conversationId);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @GetUser('id') senderId: string,
    @Body('body') body: string,
  ) {
    return this.messagesService.sendMessage(conversationId, senderId, body);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @GetUser('id') userId: string,
  ) {
    return this.messagesService.deleteMessage(conversationId, messageId, userId);
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') conversationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.messagesService.deleteConversation(conversationId, userId);
  }
}

