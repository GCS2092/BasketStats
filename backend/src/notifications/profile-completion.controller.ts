import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileCompletionService } from './profile-completion.service';

@Controller('notifications/profile')
@UseGuards(JwtAuthGuard)
export class ProfileCompletionController {
  constructor(private profileCompletionService: ProfileCompletionService) {}

  @Get('completion-status')
  async getCompletionStatus(@Request() req) {
    const userId = req.user.id;
    
    const [isComplete, percentage, missingFields, suggestions] = await Promise.all([
      this.profileCompletionService.isProfileComplete(userId),
      this.profileCompletionService.getProfileCompletionPercentage(userId),
      this.profileCompletionService.getMissingFields(userId),
      this.profileCompletionService.getProfileSuggestions(userId),
    ]);

    return {
      isComplete,
      percentage,
      missingFields,
      suggestions,
      showNotification: !isComplete && percentage < 80, // Afficher si < 80% complet
    };
  }

  @Get('suggestions')
  async getSuggestions(@Request() req) {
    const userId = req.user.id;
    return this.profileCompletionService.getProfileSuggestions(userId);
  }
}
