import { Controller, Post, Delete, Param, ParseIntPipe, UseGuards, Req, Get } from '@nestjs/common';
import { UserLikesService } from './userlikes.service'; 
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HttpStatus } from '@nestjs/common';

@Controller('likes')
export class UserLikesController {
  constructor(private readonly userLikesService: UserLikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('like/:modelId')
  async likeModel(
    @Req() req,
    @Param('modelId', ParseIntPipe) modelId: number,
  ): Promise<{ status: number; message: string }> {
    const userId = req.user.userId;
    const response = await this.userLikesService.likeModel(userId, modelId);
    return { status: HttpStatus.OK, message: response };
  }

  @UseGuards(JwtAuthGuard)
  @Post('dislike/:modelId')
  async unlikeModel(
    @Req() req,
    @Param('modelId', ParseIntPipe) modelId: number,
  ): Promise<{ status: number; message: string }> {
    const userId = req.user.userId;
    const response = await this.userLikesService.unlikeModel(userId, modelId);
    return { status: HttpStatus.OK, message: response };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mylikemodels')
  async getMyLikedModels(@Req() req) {
    const userId = req.user.userId;
    return this.userLikesService.getMyLikedModels(userId);
  }
}
