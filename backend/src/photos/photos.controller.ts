import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePhotoDto, UpdatePhotoDto } from './dto';

@Controller('photos')
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@GetUser('id') userId: string, @Body() dto: CreatePhotoDto) {
    return this.photosService.create(userId, dto);
  }

  @Get('user/:userId')
  async getUserPhotos(@Param('userId') userId: string) {
    return this.photosService.getUserPhotos(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdatePhotoDto,
  ) {
    return this.photosService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.photosService.remove(id, userId);
  }
}

