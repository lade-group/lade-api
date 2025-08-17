import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { AuthService } from '@/users/auth/auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signIn(@Body() createUserDto: CreateUserDto) {
    console.log('AuthController.register called with:', createUserDto);
    return this.authService.signIn(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Returns JWT and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh-token')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token); // limpio, sin lógica ni try/catch
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log(req);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.loginWithGoogle(req.user);

    res.redirect(
      `http://localhost:5173/login/success?token=${jwt.accessToken}&refresh=${jwt.refreshToken}`,
    );
  }
}
