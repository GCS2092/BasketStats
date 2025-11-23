import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateVideoDto, UpdateVideoDto } from './dto';

@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@GetUser('id') userId: string, @Body() dto: CreateVideoDto) {
    return this.videosService.create(userId, dto);
  }

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.videosService.findAll(page, limit);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.videosService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @GetUser('id') userId: string, @Body() dto: UpdateVideoDto) {
    return this.videosService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.videosService.remove(id, userId);
  }
}

