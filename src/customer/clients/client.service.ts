import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    return this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          street: dto.address.street,
          exterior_number: dto.address.exterior_number,
          interior_number: dto.address.interior_number,
          neighborhood: dto.address.neighborhood,
          city: dto.address.city,
          state: dto.address.state,
          country: dto.address.country,
          postal_code: dto.address.postal_code,
        },
      });

      const client = await tx.client.create({
        data: {
          name: dto.name,
          description: dto.description,
          rfc: dto.rfc,
          email: dto.email,
          phone: dto.phone,
          cfdiUse: dto.cfdiUse,
          taxRegime: dto.taxRegime,
          zipCode: dto.zipCode,
          teamId: dto.teamId,
          addressId: address.id,
        },
      });

      return client;
    });
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        address: true,
        contacts: true,
      },
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    // await this.findById(id); // valida existencia
    // return this.prisma.client.update({
    //   where: { id },
    //   data: {
    //     name: dto.name,
    //     description: dto.description,
    //     rfc: dto.rfc,
    //     email: dto.email,
    //     phone: dto.phone,
    //     addressId: dto.addressId,
    //     cfdiUse: dto.cfdiUse,
    //     taxRegime: dto.taxRegime,
    //     zipCode: dto.zipCode,
    //     teamId: dto.teamId,
    //   },
    //   include: {
    //     address: true,
    //     contacts: true,
    //   },
    // });
  }

  async remove(id: string) {
    // await this.findById(id); // valida existencia
    // return this.prisma.client.delete({ where: { id } });
  }

  async getPaginatedClients(
    page: number,
    limit: number,
    teamId: string,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { rfc: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(teamId && { teamId }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          contacts: true,
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
