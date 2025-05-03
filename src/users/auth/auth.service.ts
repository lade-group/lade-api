import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from '@/common/bcrypt/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { handlePrismaError } from '@/common/error/prisma-error';
import { UserResponseDto } from '../dto/response-user.dto';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userData: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashed: string = await this.bcryptService.hashPassword(
        userData.password,
      );

      const result: User = await this.usersService.create({
        ...userData,
        password: hashed,
      });

      const { password, deletedAt, ...sanitizedData } = result;

      return sanitizedData;
    } catch (e) {
      handlePrismaError(e);
    }
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !(await this.bcryptService.comparePasswords(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1hr',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1hr' },
      );

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
