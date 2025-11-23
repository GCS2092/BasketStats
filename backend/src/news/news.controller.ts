import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('basketball')
  async getBasketballNews() {
    return this.newsService.getBasketballNews();
  }

  @Get('nba/scores')
  async getNBAScores(@Query('per_page') perPage: string = '10') {
    return this.newsService.getNBAScores(parseInt(perPage));
  }

  @Get('nba/teams')
  async getNBATeams() {
    return this.newsService.getNBATeams();
  }
}
