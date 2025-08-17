import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BcryptService } from '@/common/bcrypt/bcrypt.service';
import { User, Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bcryptService: BcryptService,
  ) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailWithTeams(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async findByIdWithTeams(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verificar contraseña actual
    const isCurrentPasswordValid = await this.bcryptService.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedNewPassword =
      await this.bcryptService.hashPassword(newPassword);

    // Actualizar contraseña
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async getTeamUserDetail(teamId: string, userId: string) {
    const userOnTeam = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
      include: {
        User: true,
        team: true,
      },
    });

    if (!userOnTeam) {
      throw new NotFoundException('User not found in team');
    }

    return userOnTeam;
  }

  async updateUserRole(
    teamId: string,
    userId: string,
    newRole: Role,
    actorId: string,
  ) {
    const actor = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId: actorId, teamId } },
    });

    if (!actor || actor.rol !== 'OWNER') {
      throw new ForbiddenException('Solo OWNER puede cambiar roles');
    }

    return this.prisma.usersOnTeams.update({
      where: { userId_teamId: { userId, teamId } },
      data: { rol: newRole },
    });
  }
}
