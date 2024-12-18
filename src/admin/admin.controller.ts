// example.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';


// example.controller.ts
@Controller()
export class AdminController {
  @Get('admin')
  getAdminContent() {
    return 'This is admin content';
  }

  @Get('moderator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  getModeratorContent() {
    return 'This is moderator content';
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  getSellerContent() {
    return 'This is seller content';
  }

  @Get('user')
  @Roles(UserRole.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getUserContent() {
    return 'This is user content';
  }
}
