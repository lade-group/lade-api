import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DmsService } from '@/infraestructure/S3/s3.service';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
    private s3Service: DmsService,
  ) {}

  async create(dto: CreateVehicleDto, photoFile?: Express.Multer.File) {
    console.log('Creating vehicle with payload:', dto);

    // Manejar subida de foto si existe
    let imageUrl = dto.imageUrl;
    if (photoFile) {
      try {
        const key = this.s3Service.generateFileKey(
          'vehicles-profile',
          photoFile.originalname,
          dto.teamId,
        );
        imageUrl = await this.s3Service.uploadFile(
          key,
          photoFile.buffer,
          photoFile.mimetype,
          { originalName: photoFile.originalname },
        );
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
        // Continuar sin la foto si falla la subida
        imageUrl = '';
      }
    }

    // Convertir fechas de string a Date si están presentes
    const vehicleData = {
      ...dto,
      imageUrl: imageUrl || '',
      insuranceExpiry: dto.insuranceExpiry
        ? new Date(dto.insuranceExpiry)
        : null,
      registrationExpiry: dto.registrationExpiry
        ? new Date(dto.registrationExpiry)
        : null,
      lastMaintenance: dto.lastMaintenance
        ? new Date(dto.lastMaintenance)
        : null,
      nextMaintenance: dto.nextMaintenance
        ? new Date(dto.nextMaintenance)
        : null,
    };

    const result = await this.prisma.vehicle.create({
      data: vehicleData,
      include: {
        documents: true,
        maintenance: true,
      },
    });

    console.log('Vehicle created successfully:', result);
    return result;
  }

  async findAll(params: {
    teamId: string;
    status?: string;
    type?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = { teamId: params.teamId };

    if (params.status && params.status.trim() !== '') {
      where.status = params.status.toUpperCase();
    }

    if (params.type && params.type.trim() !== '') {
      where.type = {
        contains: params.type,
        mode: 'insensitive',
      };
    }

    if (params.search) {
      where.OR = [
        { plate: { contains: params.search, mode: 'insensitive' } },
        { brand: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: true,
          maintenance: {
            orderBy: { date: 'desc' },
            take: 5, // Solo los últimos 5 mantenimientos
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total };
  }

  async getFilters() {
    const types = await this.prisma.vehicle.findMany({
      distinct: ['type'],
      select: { type: true },
      orderBy: { type: 'asc' },
    });

    return {
      statusOptions: [
        'DISPONIBLE',
        'EN_USO',
        'MANTENIMIENTO',
        'CANCELADO',
        'DESUSO',
      ],
      typeOptions: types.map((t) => t.type),
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        documents: true,
        maintenance: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto) {
    console.log('Updating vehicle with payload:', dto);

    // Verificar que el vehículo existe
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Filtrar solo los campos que se pueden actualizar
    // Solo incluir campos específicos que se pueden actualizar
    const allowedFields = [
      'plate',
      'brand',
      'model',
      'type',
      'year',
      'vin',
      'status',
      'imageUrl',
      'capacity',
      'fuelType',
      'insuranceNumber',
      'insuranceExpiry',
      'registrationExpiry',
      'lastMaintenance',
      'nextMaintenance',
      'mileage',
      'notes',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        updateData[field] = dto[field];
      }
    }

    // Convertir fechas de string a Date si están presentes
    const vehicleData = {
      ...updateData,
      insuranceExpiry: updateData.insuranceExpiry
        ? new Date(updateData.insuranceExpiry)
        : null,
      registrationExpiry: updateData.registrationExpiry
        ? new Date(updateData.registrationExpiry)
        : null,
      lastMaintenance: updateData.lastMaintenance
        ? new Date(updateData.lastMaintenance)
        : null,
      nextMaintenance: updateData.nextMaintenance
        ? new Date(updateData.nextMaintenance)
        : null,
    };

    console.log('Filtered vehicle data for update:', vehicleData);

    const result = await this.prisma.vehicle.update({
      where: { id },
      data: vehicleData,
      include: {
        documents: true,
        maintenance: true,
      },
    });

    console.log('Vehicle updated successfully:', result);
    return result;
  }

  async remove(id: string) {
    // Cambiar status a DESUSO en lugar de eliminar físicamente
    const result = await this.prisma.vehicle.update({
      where: { id },
      data: { status: 'DESUSO' },
    });

    console.log('Vehicle deactivated successfully:', result);
    return result;
  }

  async updateStatus(id: string, status: string) {
    const result = await this.prisma.vehicle.update({
      where: { id },
      data: { status: status as any },
    });

    console.log('Vehicle status updated successfully:', result);
    return result;
  }

  async getPaginatedVehicles(params: {
    teamId: string;
    status?: string;
    type?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    return this.findAll(params);
  }
}
