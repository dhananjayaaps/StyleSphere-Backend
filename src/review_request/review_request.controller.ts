import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  UseGuards,
  Req,
  Get,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewRequestService } from './review_request.service';
import { ReviewRequest } from './entities/review_request.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('review-requests')
export class ReviewRequestController {
  constructor(private readonly reviewRequestService: ReviewRequestService) {}

  // CREATE Review Request
  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createReviewRequest(@Body() createReviewRequestDto: Partial<ReviewRequest>, @Req() req) {
    try {
      const userId = req.user.id; // Assuming `req.user` contains the authenticated user
      return await this.reviewRequestService.createReviewRequest(createReviewRequestDto, userId);
    } catch (error) {
      console.error('Error creating review request:', error);
      if (error.message.includes('User not found') || error.message.includes('Seller not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to create review request. Please check your input.');
    }
  }

  // UPDATE Review Request Status
  @Patch(':id/status')
  async updateStatus(@Param('id') id: number, @Body('resolved') resolved: boolean) {
    try {
      return await this.reviewRequestService.updateStatus(id, resolved);
    } catch (error) {
      console.error('Error updating review request status:', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException('Review request not found.');
      }
      throw new InternalServerErrorException('Failed to update review request status.');
    }
  }

  // DELETE Review Request
  @Delete(':id')
  @HttpCode(204)
  async deleteReviewRequest(@Param('id') id: number) {
    try {
      return await this.reviewRequestService.deleteReviewRequest(id);
    } catch (error) {
      console.error('Error deleting review request:', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException('Review request not found.');
      }
      throw new InternalServerErrorException('Failed to delete review request.');
    }
  }

  // ACCEPT Review Request
  // @Roles(UserRole.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('accept/:id')
  async acceptReviewRequest(@Param('id') id: number, @Req() req) {
    try {
      const userId = req.user.userId; // Assuming `req.user` contains the authenticated user
      return await this.reviewRequestService.approveReviewRequest(id, userId);
    } catch (error) {
      console.error('Error accepting review request:', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException('Review request not found.');
      }
      throw new InternalServerErrorException('Failed to accept review request.');
    }
  }

   // ACCEPT Review Request
  // @Roles(UserRole.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('decline/:id')
  async declineReviewRequest(
    @Param('id') id: number,
    @Body('reviewNotes') reviewNotes: string,
    @Req() req,
  ) {
    try {
      const userId = req.user.userId;
      return await this.reviewRequestService.declineReviewRequest(id, reviewNotes, userId);
    } catch (error) {
      console.error('Error declining review request:', error);
      if (error.message.includes('not found')) {
        throw new NotFoundException('Review request not found.');
      }
      throw new InternalServerErrorException('Failed to decline review request.');
    }
  }

  // make a get request
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.MODERATOR)
  @Get()
  async getReviewRequests() {
    try {
      return await this.reviewRequestService.getReviewRequests();
    } catch (error) {
      console.error('Error getting review requests:', error);
      throw new InternalServerErrorException('Failed to get review requests.');
    }
  }

  @Get('moderator-dashboard')
  async getModeratorDashboard() {
    try {
      return await this.reviewRequestService.getModeratorDashboard();
    } catch (error) {
      console.error('Error getting moderator dashboard:', error);
      throw new InternalServerErrorException('Failed to get moderator dashboard.');
    }
  }
}
