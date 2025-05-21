import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDriverDto } from '../dto/create-driver.dto';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    return this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({ data: dto.address });

      const driver = await tx.driver.create({
        data: {
          name: dto.name,
          photoUrl: dto.photoUrl,
          licenseNumber: dto.licenseNumber,
          addressId: address.id,
          teamId: dto.teamId,
          status: dto.status,
        },
      });

      if (dto.contacts && dto.contacts.length > 0) {
        await tx.contact.createMany({
          data: dto.contacts.map((c) => ({
            driverId: driver.id,
            type: c.type,
            value: c.value,
          })),
        });
      }

      return driver;
    });
  }

  async findAll(params: {
    teamId: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = { teamId: params.teamId };
    if (params.status) where.status = params.status.toUpperCase();

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { data, total };
  }

  async getFilters() {
    return {
      statusOptions: ['DISPONIBLE', 'EN_VIAJE', 'DESACTIVADO'],
    };
  }

  async findOne(id: string) {
    return this.prisma.driver.findUnique({ where: { id } });
  }
}
