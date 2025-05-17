import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId =
      request.params.teamId ||
      request.query.teamId ||
      request.headers['x-current-team-id'];

    if (!user || !teamId) {
      throw new ForbiddenException('User or teamId missing.');
    }

    const userTeam = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: {
          userId: user.userId,
          teamId: teamId,
        },
      },
    });

    if (!userTeam) {
      throw new ForbiddenException('User is not part of the team.');
    }

    if (!requiredRoles.includes(userTeam.rol)) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}
