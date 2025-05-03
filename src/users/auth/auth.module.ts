import { Module } from '@nestjs/common';
import { AuthController } from '@/users/auth/auth.controller';
import { AuthService } from '@/users/auth/auth.service';
import { UsersModule } from '@/users/users/users.module';
import { BcryptModule } from '@/common/bcrypt/bcrypt.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/utils/strategies/jwt.strategy';
import { JwtAuthGuard } from '@/utils/guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    BcryptModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1hr' },
    }),
    JwtModule.register({
      secret: process.env.JWT_REFRESH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
