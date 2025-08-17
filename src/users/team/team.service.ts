// team.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressService } from '@/geolocation/address/address.service';
import { HandlePrismaError } from '@/utils/decorators/handle-prisma-errors';
import { TeamAccessService } from './access.service';
import { DmsService } from '@/infraestructure/S3/s3.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private readonly addressService: AddressService,
    private readonly accessService: TeamAccessService,
    private readonly dmsService: DmsService,
  ) {}

  /**
   * Creates a new team, including a new address, and assigns the user as OWNER.
   *
   * @param createTeamDto - Contains team name, logo, address info, and creator userId
   * @returns The created team and address
   */
  @HandlePrismaError()
  async create(createTeamDto: CreateTeamDto, logoFile?: Express.Multer.File) {
    const { name, logo, address, invites = [], userId } = createTeamDto;
    console.log('createTeamDto', createTeamDto);
    return this.prisma.$transaction(async (tx) => {
      const createdAddress = await this.addressService.create(address, tx);
      console.log('logoFile', logoFile);
      // Manejar subida de logo si existe
      let logoUrl = logo;
      if (logoFile) {
        try {
          const key = this.dmsService.generateFileKey(
            'teams',
            logoFile.originalname,
            userId,
          );
          logoUrl = await this.dmsService.uploadFile(
            key,
            logoFile.buffer,
            logoFile.mimetype,
            { originalName: logoFile.originalname },
          );
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError);
          // Continuar sin el logo si falla la subida
          logoUrl = '';
        }
      }
      console.log('logoUrl', logoUrl);
      const createdTeam = await tx.team.create({
        data: {
          name,
          logo: logoUrl || '',
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

      if (invites.length > 0) {
        await this.accessService.inviteUsersToTeam(invites, createdTeam.id, tx);
      }

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
  async getTeamUsers(teamId: string) {
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
  async updateTeam(teamId: string, userId: string, data: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { address: true },
    });
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
      include: { address: true },
    });
  }

  /**
   * Gets team information by ID. Only team members can access.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the requesting user
   * @returns The team with address information
   */
  @HandlePrismaError()
  async getTeamById(teamId: string, userId: string) {
    const membership = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        address: true,
        users: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  /**
   * Deactivates a team (soft delete). Only OWNER can perform this action.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @returns Success message
   */
  @HandlePrismaError()
  async deactivateTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const owner = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!owner || owner.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can deactivate the team');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: { status: 'INACTIVE' },
    });

    return { message: 'Team deactivated successfully' };
  }

  /**
   * Reactivates a team. Only OWNER can perform this action.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @returns Success message
   */
  @HandlePrismaError()
  async reactivateTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const owner = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!owner || owner.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can reactivate the team');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: { status: 'ACTIVE' },
    });

    return { message: 'Team reactivated successfully' };
  }

  /**
   * Suspends a team. Only OWNER can perform this action.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @returns Success message
   */
  @HandlePrismaError()
  async suspendTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const owner = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!owner || owner.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can suspend the team');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: { status: 'SUSPENDED' },
    });

    return { message: 'Team suspended successfully' };
  }

  /**
   * Updates team address. Only OWNER can perform this action.
   *
   * @param teamId - ID of the team
   * @param userId - ID of the acting user
   * @param addressData - Address data to update
   * @returns The updated team with address
   */
  @HandlePrismaError()
  async updateTeamAddress(
    teamId: string,
    userId: string,
    addressData: UpdateAddressDto,
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { address: true },
    });
    if (!team) throw new NotFoundException('Team not found');

    const owner = await this.prisma.usersOnTeams.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!owner || owner.rol !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can update the team address');
    }

    // Update the address
    await this.prisma.address.update({
      where: { id: team.addressId },
      data: addressData,
    });

    // Return the updated team with address
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: { address: true },
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
  async deleteTeam(teamId: string, userId: string) {
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
    teamId: string,
    targetUserId: string,
    actorUserId: string,
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

  async getTeamsForUser(userId: string) {
    console.log('getTeamsForUser called with userId:', userId);
    try {
      const teams = await this.prisma.usersOnTeams.findMany({
        where: { userId },
        include: {
          team: {
            include: {
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      console.log('Found teams:', teams);
      return teams;
    } catch (error) {
      console.error('Error in getTeamsForUser:', error);
      throw error;
    }
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
    teamId: string,
    newOwnerId: string,
    currentOwnerId: string,
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
  async leaveTeam(teamId: string, userId: string) {
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
