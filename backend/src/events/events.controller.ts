import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
    @Query('clubId') clubId?: string,
    @Query('featured') featured?: string,
  ) {
    return this.eventsService.findAll({
      type,
      upcoming: upcoming === 'true',
      clubId,
      featured: featured === 'true',
    });
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  getMyEvents(@GetUser('id') userId: string) {
    return this.eventsService.getPlayerEvents(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') eventId: string, @GetUser('id') userId: string) {
    return this.eventsService.register(eventId, userId);
  }

  @Post(':id/participate')
  @UseGuards(JwtAuthGuard)
  participate(@Param('id') eventId: string, @GetUser('id') userId: string) {
    // Alias de register pour compatibilité avec les apps Flutter
    return this.eventsService.register(eventId, userId);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(@Param('id') eventId: string, @GetUser('id') userId: string) {
    return this.eventsService.unregister(eventId, userId);
  }

  @Delete(':id/participate')
  @UseGuards(JwtAuthGuard)
  unparticipate(@Param('id') eventId: string, @GetUser('id') userId: string) {
    // Alias de unregister pour compatibilité avec les apps Flutter
    return this.eventsService.unregister(eventId, userId);
  }
}

