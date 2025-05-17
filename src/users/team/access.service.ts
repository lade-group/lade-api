// team-access.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HandlePrismaError } from '@/utils/decorators/handle-prisma-errors';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class TeamAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invites an existing user to join a team via their email.
   * Throws if the user does not exist or is already in the team.
   *
   * @param teamId - ID of the team
   * @param email - Email address of the user to invite
   * @returns A success message
   */
  @HandlePrismaError()
  async inviteUsersToTeam(
    emails: string[],
    teamId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    for (const email of emails) {
      const existingUser = await tx.user.findUnique({ where: { email } });

      if (existingUser) {
        console.log(`Correo enviado a ${email} (usuario existente)`);
      } else {
        await tx.teamInvitation.upsert({
          where: { email_teamId: { email, teamId } },
          update: {},
          create: { email, teamId },
        });
        console.log(`Correo enviado a ${email} (nuevo invitado)`);
      }
    }
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
  async acceptTeamInvitation(userId: string, teamId: string) {
    // const invitation = await this.prisma.teamInvitation.findUnique({
    //   where: { userId_teamId: { userId, teamId } },
    // });
    // if (!invitation) throw new NotFoundException('No invitation found');
    // await this.prisma.$transaction(async (tx) => {
    //   await tx.teamInvitation.delete({
    //     where: { userId_teamId: { userId, teamId } },
    //   });
    //   await tx.usersOnTeams.create({
    //     data: { userId, teamId, rol: 'USER' },
    //   });
    // });
    // return { message: 'Invitation accepted' };
  }
}
