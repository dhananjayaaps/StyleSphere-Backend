// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from '../users/user.entity';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.isVerified) {
        throw new UnauthorizedException('Email not verified');
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRATION_TIME || '1d', // Default to 1 day if not set
      }),
    };
  }
  

  async register(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, roles, userName } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }
  
    const verificationToken = Math.random().toString(36).substr(2); // Generate a random token
  
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      roles,
      firstName,
      lastName,
      userName,
      isVerified: true,
      verificationToken
    });
  
    // Send verification email
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.GMAIL_USER, // Your Gmail address
    //     pass: process.env.GMAIL_PASS, // Your Gmail app password
    //   },
    // });
  
    return { message: 'Registration successful! Please check your email to verify your account.' };
  }


  async googleLogin(user: any) {
    let existingUser = await this.usersService.findOneByGoogleId(user.id);
    if (!existingUser) {
      existingUser = await this.usersService.create({
        email: user.emails[0].value,
        googleId: user.id,
        roles: [UserRole.USER],
      });
    }

    const payload = { email: existingUser.email, sub: existingUser.id, roles: existingUser.roles };
    return {
      access_token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET_KEY }),
    };
  }

  async createUserByAdmin(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password, roles, userName, contactNo } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const verificationToken = Math.random().toString(36).substr(2); // Generate a random token

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      roles,
      firstName,
      lastName,
      userName,
      isVerified: false,
      isActive: true,
      verificationToken,
      contactNo: contactNo.toString(),
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `
        <p>Hi ${firstName},</p>
        <p>Your account has been created. Please verify your email by clicking on the link below:</p>
        <a href="${process.env.APP_URL}/auth/verify-email?token=${verificationToken}">Verify Email</a>
        <p>Your password: ${password}</p>
      `,
    };

    // await transporter.sendMail(mailOptions);

    return { message: 'User created successfully! Please check your email to verify your account.' };
  }

  // i need a endpoint to get total number of users , active users count, deactivated users count and list of the those users Name, email, contact, status by a role and that must be filter by the email name and the status
  async getUsersByRole(role: string, name: string, email: string, status: string) {
    const users = await this.usersService.getUsersByRole(role, name, email, status);
    return users;
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await this.usersService.update(user.id, user);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${process.env.APP_URL}/auth/reset-password?token=${resetToken}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { message: 'Reset password email sent successfully' };
  }

  async verifyResetPasswordToken(token: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || user.resetTokenExpiry < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    return { message: 'Token is valid', userId: user.id };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || user.resetTokenExpiry < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.usersService.update(user.id, user);

    return { message: 'Password reset successfully' };
  }

  // authService.changePassword(req.user.userId, oldPassword, newPassword)
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await  this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!await bcrypt.compare(oldPassword, user.password)) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(userId, user);

    return { message: 'Password changed successfully' };
  }

}
