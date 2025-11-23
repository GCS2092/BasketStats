import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}

