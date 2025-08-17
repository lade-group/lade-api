import { Module } from '@nestjs/common';
import { UsersService } from '@/users/users/users.service';
import { UsersController } from '@/users/users/users.controller';
import { BcryptModule } from '@/common/bcrypt/bcrypt.module';

@Module({
  imports: [BcryptModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
