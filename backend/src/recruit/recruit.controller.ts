import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { RecruitService } from './recruit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateRecruitRequestDto } from './dto/create-recruit-request.dto';

@Controller('recruit')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class RecruitController {
  constructor(private recruitService: RecruitService) {}

  // Nouvelle route simplifiée pour créer une offre
  @Post()
  async createRequest(@GetUser('id') userId: string, @Body() dto: CreateRecruitRequestDto) {
    return this.recruitService.createRequest(userId, dto);
  }

  @Post('requests')
  async createRequestLegacy(@GetUser('id') userId: string, @Body() dto: CreateRecruitRequestDto) {
    return this.recruitService.createRequest(userId, dto);
  }

  // Offres reçues (joueur)
  @Get('received')
  async getReceivedRequests(@GetUser('id') userId: string) {
    const requests = await this.recruitService.getReceivedRequests(userId);
    return { requests };
  }

  @Get('requests/received')
  async getReceivedRequestsLegacy(@GetUser('id') userId: string) {
    return this.recruitService.getReceivedRequests(userId);
  }

  // Offres envoyées (recruteur)
  @Get('sent')
  async getSentRequests(@GetUser('id') userId: string) {
    const requests = await this.recruitService.getSentRequests(userId);
    return { requests };
  }

  @Get('requests/sent')
  async getSentRequestsLegacy(@GetUser('id') userId: string) {
    return this.recruitService.getSentRequests(userId);
  }

  // Mettre à jour le statut d'une offre
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.recruitService.updateStatus(id, status);
  }

  @Put('requests/:id/status')
  async updateStatusLegacy(@Param('id') id: string, @Body('status') status: string) {
    return this.recruitService.updateStatus(id, status);
  }

  // Liste des joueurs ayant accepté mes offres (recruteur uniquement)
  @Get('my-players')
  async getMyPlayers(@GetUser('id') recruiterId: string) {
    const players = await this.recruitService.getMyPlayers(recruiterId);
    return { players };
  }

  // Demande de contact de joueur vers recruteur
  @Post('contact-request')
  async createContactRequest(
    @GetUser('id') playerId: string,
    @Body('recruiterId') recruiterId: string,
    @Body('message') message: string,
  ) {
    return this.recruitService.createContactRequest(playerId, recruiterId, message);
  }
}


