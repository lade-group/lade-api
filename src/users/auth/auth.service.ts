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
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userData: CreateUserDto): Promise<AuthResponseDto> {
    try {
      const hashed = await this.bcryptService.hashPassword(userData.password);

      const newUser = await this.usersService.create({
        ...userData,
        password: hashed,
      });

      return this.buildAuthResponse(newUser);
    } catch (e) {
      handlePrismaError(e);
    }
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithTeams(email);

    if (
      !user ||
      !(await this.bcryptService.comparePasswords(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { hasTeams, ...sanitizedData } = this.buildAuthResponse(user);

    const hasTeamsSanitized = user.teams && user.teams.length > 0;

    return {
      ...sanitizedData,
      hasTeams: hasTeamsSanitized,
    };
  }

  async loginWithGoogle(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponseDto> {
    let user = await this.usersService.findByEmailWithTeams(googleUser.email);

    if (!user) {
      const { email, firstName, lastName } = googleUser;

      const passwordPlaceholder = `google-${Date.now()}`;

      // Procesar nombres
      const nameParts = (firstName || 'GoogleNombre').split(' ');
      const name = nameParts[0];
      const middle_name =
        nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Procesar apellidos
      const lastNameParts = (lastName || 'GoogleApellido').split(' ');
      const father_last_name = lastNameParts[0];
      const mother_last_name =
        lastNameParts.length > 1 ? lastNameParts.slice(1).join(' ') : 'Google';

      await this.usersService.create({
        email,
        name,
        middle_name,
        father_last_name,
        mother_last_name,
        phone: '0000000000',
        password: passwordPlaceholder,
      });

      user = await this.usersService.findByEmailWithTeams(googleUser.email);

      throw new UnauthorizedException('No se pudo autenticar con Google');
    }

    const { hasTeams, ...sanitizedData } = this.buildAuthResponse(user);
    const hasTeamsSanitized = false;

    return {
      ...sanitizedData,
      hasTeams: hasTeamsSanitized,
    };
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

  private buildAuthResponse(user: User): AuthResponseDto {
    const { password, deletedAt, ...sanitizedUser } = user;

    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    let hasTeams = false;

    return {
      ...sanitizedUser,
      accessToken,
      refreshToken,
      hasTeams,
    };
  }
}
