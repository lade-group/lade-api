import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: data,
      include: {
        teams: true,
      },
    });
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
        teams: true,
      },
    });
  }

  async findByIdWithTeams(userId: string) {
    return this.prisma.user.findUnique({
      omit: {
        password: true,
      },
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

  async getTeamUserDetail(teamId: string, userId: string) {
    const userOnTeam = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            middle_name: true,
            father_last_name: true,
            mother_last_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!userOnTeam)
      throw new NotFoundException('Usuario no encontrado en el equipo');

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
