import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users/users.module';
import { AuthModule } from '@/users/auth/auth.module';
import { TeamModule } from '@/users/team/team.module';
@Module({
  imports: [AuthModule, UsersModule, TeamModule],
})
export class AccountsModule {}
