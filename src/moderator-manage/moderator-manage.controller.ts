import { Controller, Get, UseGuards, Request, Post, Body , Res, HttpException, HttpStatus, Delete} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { ModeratorManageService } from './moderator-manage.service';

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moderator-manage')
export class ModeratorManageController {
  constructor(private moderatorManageService: ModeratorManageService) {}

  @Post('create')
  async CretaeModerator(@Body() createUserDto: CreateModeratorDto, @Res() res: Response) {
    try {
    //   const token = await this.authService.register(createUserDto);
      const createdUser =  await this.moderatorManageService.register(createUserDto);
      return res.send({ success: true, message: 'Moderator created successfully' });
        
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('delete')
  async DeleteModerator(@Body() body: { email: string }, @Res() res: Response) {
    try {
      const deletedUser =  await this.moderatorManageService.delete(body.email);
      return res.send({ success: true, message: 'Moderator deleted successfully' });
        
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}
