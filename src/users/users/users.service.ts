import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

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
}
