import { Controller, Post, UseGuards, Request, Body, Get, Res, HttpException, HttpStatus, Param, Patch } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { Query } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: { email: string, password: string }, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      const token = await this.authService.login(user);
      res.cookie('access_token', token.access_token, { httpOnly: true,sameSite: 'none',secure:true, path: '/', maxAge: 24 * 60 * 60 * 1000 }); // Set the cookie
      return res.send({ success: true ,details: user});
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // return req.user;
    return this.usersService.findOneById(req.user.userId);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const token = await this.authService.register(createUserDto);
      return res.send({ success: true });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findByVerificationToken(token);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
      }

      user.isVerified = true;
      user.verificationToken = null; // Clear the token
      await this.usersService.update(user.id, user);

      return res.send({ message: 'Email successfully verified! You can now log in.' });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
 }


  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {
    return req.user;
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    try {
      const token = await this.authService.googleLogin(req.user);
      res.cookie('access_token', token.access_token, { httpOnly: true,sameSite: 'none',secure:true, path: '/', maxAge: 60 * 60 * 1000 }); // Set the cookie
      return res.send({ success: true });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-user')
  async createUser(@Body() body: CreateUserDto, @Res() res: Response) {
    try {
      const { firstName, lastName, email, password, roles, userName, contactNo } = body;

      // Validate that the role is allowed (admin, system admin, or moderator)
      // if (!['admin', 'system-admin', 'moderator'].includes(roles)) {
      //   throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
      // }

      const token = await this.authService.createUserByAdmin({ firstName, lastName, email, password, roles, userName, contactNo });

      return res.send({ success: true, message: 'User created successfully. Verification email sent.' });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint for deactivating user roles
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('deactivate-user/:id')
  async deactivateUser(@Param('id') userId: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findOneById(Number(userId));
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.isActive = false;
      await this.usersService.update(user.id, user);

      return res.send({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint for activating user roles
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('activate-user/:id')
  async activateUser(@Param('id') userId: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findOneById(Number(userId));
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.isActive = true;
      await this.usersService.update(user.id, user);

      return res.send({ success: true, message: 'User activated successfully' });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // i need a endpoint to get total number of users , active users count, deactivated users count and list of the those users Name, email, contact, status by a role and that must be filter by the email name and the status
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users')
  async getUsersByRole(@Query('role') role: string, @Query('email') email: string, @Query('status') status: string, @Query('name') name: string ,@Res() res: Response) {
    try {
      const users = await this.authService.getUsersByRole(role, name, email, status);
      return res.send(users);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('forgot-password')
  async sendResetPasswordEmail(@Body('email') email: string, @Res() res: Response) {
    try {
      const response = await this.authService.sendResetPasswordEmail(email);
      return res.send(response);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. Verify Reset Password Token
  @Get('reset-password')
  async verifyResetPasswordToken(@Query('token') token: string, @Res() res: Response) {
    try {
      const response = await this.authService.verifyResetPasswordToken(token);
      return res.send(response);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. Reset Password
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
    @Res() res: Response,
  ) {
    try {
      const response = await this.authService.resetPassword(token, newPassword);
      return res.send(response);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
    @Res() res: Response,
  ) {
    try {
      const response = await this.authService.changePassword(req.user.userId, oldPassword, newPassword);
      return res.send(response);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


