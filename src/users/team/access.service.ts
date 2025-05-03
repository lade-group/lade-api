// team-access.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { HandlePrismaError } from '@/utils/decorators/handle-prisma-errors';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class TeamAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique join code for the team.
   * Only a user with OWNER role can invoke this.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the user requesting the code
   * @returns An object containing the teamId and generated code
   */
  @HandlePrismaError()
  async generateJoinCode(teamId: number, userId: number) {
    const membership = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!membership || membership.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can generate join code');
    }
    const code = randomBytes(3).toString('hex');
    await this.prisma.team.update({
      where: { id: teamId },
      data: { joinCode: code },
    });
    return { teamId, code };
  }

  /**
   * Invites an existing user to join a team via their email.
   * Throws if the user does not exist or is already in the team.
   *
   * @param teamId - ID of the team
   * @param email - Email address of the user to invite
   * @returns A success message
   */
  @HandlePrismaError()
  async inviteUserByEmail(teamId: number, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User with email not found');

    const exists = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId: user.id, teamId } },
    });
    if (exists) throw new ConflictException('User is already in this team');

    await this.prisma.teamInvitation.create({
      data: { userId: user.id, teamId },
    });
    return { message: 'Invitation created' };
  }

  /**
   * Allows a user to join a team using a join code.
   * Throws if the team does not exist or the user is already a member.
   *
   * @param userId - ID of the user joining
   * @param code - The join code of the team
   * @returns The created membership entry
   */
  @HandlePrismaError()
  async joinTeamByCode(userId: number, code: string) {
    const team = await this.prisma.team.findUnique({
      where: { joinCode: code },
    });
    if (!team) throw new NotFoundException('Team not found');

    const existing = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId: team.id } },
    });
    if (existing) throw new ForbiddenException('Already a member of this team');

    return await this.prisma.usersOnTeams.create({
      data: { userId, teamId: team.id, rol: 'USER' },
    });
  }

  /**
   * Accepts a pending invitation for a user to join a team.
   * Removes the invitation and adds the user as a member.
   *
   * @param userId - ID of the user accepting the invite
   * @param teamId - ID of the team
   * @returns A success message
   */
  @HandlePrismaError()
  async acceptTeamInvitation(userId: number, teamId: number) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!invitation) throw new NotFoundException('No invitation found');

    await this.prisma.$transaction(async (tx) => {
      await tx.teamInvitation.delete({
        where: { userId_teamId: { userId, teamId } },
      });
      await tx.usersOnTeams.create({
        data: { userId, teamId, rol: 'USER' },
      });
    });

    return { message: 'Invitation accepted' };
  }
}
