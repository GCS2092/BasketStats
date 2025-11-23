import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ClubApplicationsService } from './club-applications.service';
import { CreateClubApplicationDto } from './dto/create-club-application.dto';
import { UpdateClubApplicationDto } from './dto/update-club-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApplicationStatus } from '@prisma/client';

@Controller('clubs')
@UseGuards(JwtAuthGuard)
export class ClubApplicationsController {
  constructor(private readonly clubApplicationsService: ClubApplicationsService) {}

  @Post('applications')
  create(@Body() createClubApplicationDto: CreateClubApplicationDto, @GetUser('id') userId: string) {
    return this.clubApplicationsService.create(createClubApplicationDto, userId);
  }

  @Get('applications')
  findAll(
    @Query('clubId') clubId?: string,
    @Query('playerId') playerId?: string,
    @Query('status') status?: ApplicationStatus
  ) {
    return this.clubApplicationsService.findAll(clubId, playerId, status);
  }

  @Get('applications/my')
  findMyApplications(@GetUser('id') userId: string) {
    return this.clubApplicationsService.getPlayerApplications(userId);
  }

  @Get(':clubId/applications')
  getClubApplications(@Param('clubId') clubId: string, @GetUser('id') userId: string) {
    return this.clubApplicationsService.getClubApplications(clubId, userId);
  }

  @Get('applications/:id')
  findOne(@Param('id') id: string) {
    return this.clubApplicationsService.findOne(id);
  }

  @Patch('applications/:id')
  update(
    @Param('id') id: string,
    @Body() updateClubApplicationDto: UpdateClubApplicationDto,
    @GetUser('id') userId: string
  ) {
    return this.clubApplicationsService.update(id, updateClubApplicationDto, userId);
  }

  @Patch('applications/:id/withdraw')
  withdraw(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.clubApplicationsService.withdraw(id, userId);
  }

  @Delete('applications/:id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.clubApplicationsService.remove(id, userId);
  }
}
