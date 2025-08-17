import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
} from '@nestjs/common';
import { Auth } from '@/utils/decorators/auth.decorator';
import { UsersService } from '@/users/users/users.service';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.userId, dto);
  }

  @Auth()
  @Put('change-password')
  async changePassword(
    @Req() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Auth()
  @Get('profile')
  async getProfile(@Request() req) {
    const jwtUser = req.user;
    const user = await this.usersService.findByIdWithTeams(jwtUser.userId);

    // Obtener el rol del usuario en el equipo actual
    let userRole = 'USER'; // Por defecto
    if (user?.teams && user.teams.length > 0) {
      // Tomar el primer equipo como el actual (puedes ajustar esta lógica según tu necesidad)
      const currentTeam = user.teams[0];
      userRole = currentTeam.rol || 'USER';
    }

    return {
      ...jwtUser,
      ...user,
      role: userRole,
    };
  }

  @Auth()
  @Get(':teamId/users/:userId')
  getUserDetails(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.getTeamUserDetail(teamId, userId);
  }

  @Auth('OWNER')
  @Patch(':teamId/users/:userId/role')
  changeUserRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() body: { role: Role },
    @Req() req,
  ) {
    return this.usersService.updateUserRole(
      teamId,
      userId,
      body.role,
      req.user.userId,
    );
  }
}
