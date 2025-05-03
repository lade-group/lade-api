// team.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddressService } from '@/geolocation/address/address.service';
import { HandlePrismaError } from '@/utils/decorators/handle-prisma-errors';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private readonly addressService: AddressService,
  ) {}

  /**
   * Creates a new team, including a new address, and assigns the user as OWNER.
   *
   * @param createTeamDto - Contains team name, logo, address info, and creator userId
   * @returns The created team and address
   */
  @HandlePrismaError()
  async create(createTeamDto: CreateTeamDto) {
    const { name, logo, address, userId } = createTeamDto;
    return this.prisma.$transaction(async (tx) => {
      const createdAddress = await this.addressService.create(address, tx);
      const createdTeam = await tx.team.create({
        data: {
          name,
          logo,
          address: {
            connect: { id: createdAddress.id },
          },
        },
      });
      await tx.usersOnTeams.create({
        data: {
          userId,
          teamId: createdTeam.id,
          rol: 'OWNER',
        },
      });
      return { team: createdTeam, address: createdAddress };
    });
  }

  /**
   * Lists all users associated with a team including their user data.
   *
   * @param teamId - Team identifier
   * @returns Array of team-user relationships with embedded user info
   */
  @HandlePrismaError()
  async getTeamUsers(teamId: number) {
    return this.prisma.usersOnTeams.findMany({
      where: { teamId },
      include: { User: true },
    });
  }

  /**
   * Updates team information (name, logo, etc). Restricted to OWNER.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @param data - Fields to update on the team
   * @returns The updated team
   */
  @HandlePrismaError()
  async updateTeam(teamId: number, userId: number, data: any) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const owner = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!owner || owner.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can update the team');
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data,
    });
  }

  /**
   * Deletes a team and its associated user relationships. Restricted to OWNER.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @returns Success message after deletion
   */
  @HandlePrismaError()
  async deleteTeam(teamId: number, userId: number) {
    const membership = await this.prisma.usersOnTeams.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });
    if (!membership || membership.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can delete the team');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.usersOnTeams.deleteMany({ where: { teamId } });
      await tx.team.delete({ where: { id: teamId } });
    });
    return { message: 'Team and related memberships deleted successfully' };
  }

  /**
   * Removes a user from the team. Only OWNER can perform this action.
   *
   * @param teamId - Team ID
   * @param targetUserId - ID of the user to be removed
   * @param actorUserId - ID of the acting user
   * @returns Deleted membership record
   */
  @HandlePrismaError()
  async removeUserFromTeam(
    teamId: number,
    targetUserId: number,
    actorUserId: number,
  ) {
    const actor = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId: actorUserId, teamId } },
    });
    if (!actor || actor.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can remove users');
    }

    return this.prisma.usersOnTeams.delete({
      where: {
        userId_teamId: { userId: targetUserId, teamId },
      },
    });
  }

  /**
   * Transfers ownership of a team to another user. Demotes the current owner to ADMIN.
   *
   * @param teamId - Team ID
   * @param newOwnerId - ID of the new owner
   * @param currentOwnerId - ID of the current owner
   * @returns Success message
   */
  @HandlePrismaError()
  async transferOwnership(
    teamId: number,
    newOwnerId: number,
    currentOwnerId: number,
  ) {
    const current = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId: currentOwnerId, teamId } },
    });
    if (!current || current.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can transfer ownership');
    }

    const target = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId: newOwnerId, teamId } },
    });
    if (!target) throw new NotFoundException('Target user not in the team');

    await this.prisma.$transaction([
      this.prisma.usersOnTeams.update({
        where: { userId_teamId: { userId: currentOwnerId, teamId } },
        data: { rol: 'ADMIN' },
      }),
      this.prisma.usersOnTeams.update({
        where: { userId_teamId: { userId: newOwnerId, teamId } },
        data: { rol: 'OWNER' },
      }),
    ]);

    return { message: 'Ownership transferred successfully' };
  }

  /**
   * Allows a user to leave a team, except if they are the OWNER.
   *
   * @param teamId - Team ID
   * @param userId - User ID of the one leaving
   * @returns Success message
   */
  @HandlePrismaError()
  async leaveTeam(teamId: number, userId: number) {
    const member = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) throw new NotFoundException('User not in team');
    if (member.rol === 'OWNER') {
      throw new ForbiddenException('Owner cannot leave the team');
    }

    await this.prisma.usersOnTeams.delete({
      where: { userId_teamId: { userId, teamId } },
    });

    return { message: 'You have left the team' };
  }
}
