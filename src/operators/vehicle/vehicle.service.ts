import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: dto });
  }

  async findAll(params: {
    teamId: string;
    status?: string;
    type?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = { teamId: params.teamId };
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
