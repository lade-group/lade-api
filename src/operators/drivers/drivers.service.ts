import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DmsService } from '@/infraestructure/S3/s3.service';
import { CreateDriverDto } from '../dto/create-driver.dto';
import { UpdateDriverDto } from '../dto/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    private prisma: PrismaService,
    private s3Service: DmsService,
  ) {}

  async create(dto: CreateDriverDto, photoFile?: Express.Multer.File) {
    try {
      console.log('Iniciando creación de conductor con DTO:', dto);

      return this.prisma.$transaction(async (tx) => {
        console.log('Creando dirección...');
        const address = await tx.address.create({ data: dto.address });
        console.log('Dirección creada:', address);

        // Manejar subida de foto si existe
        let photoUrl = dto.photoUrl;
        if (photoFile) {
          try {
            const key = this.s3Service.generateFileKey(
              'drivers-profile',
              photoFile.originalname,
              dto.teamId,
            );
            photoUrl = await this.s3Service.uploadFile(
              key,
              photoFile.buffer,
              photoFile.mimetype,
              { originalName: photoFile.originalname },
            );
          } catch (uploadError) {
            console.error('Error uploading photo:', uploadError);
            // Continuar sin la foto si falla la subida
            photoUrl = '';
          }
        }

        console.log('Creando conductor...');
        const driver = await tx.driver.create({
          data: {
            name: dto.name,
            photoUrl: photoUrl || '',
            licenseNumber: dto.licenseNumber,
            addressId: address.id,
            teamId: dto.teamId,
            status: dto.status,
            curp: dto.curp,
            rfc: dto.rfc,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
            licenseExpiry: dto.licenseExpiry
              ? new Date(dto.licenseExpiry)
              : null,
            medicalExpiry: dto.medicalExpiry
              ? new Date(dto.medicalExpiry)
              : null,
            emergencyContact: dto.emergencyContact,
            bloodType: dto.bloodType,
            allergies: dto.allergies,
            specialNotes: dto.specialNotes,
            experience: dto.experience,
            certifications: dto.certifications,
            salary: dto.salary,
            paymentMethod: dto.paymentMethod,
            bankAccount: dto.bankAccount,
          },
        });
        console.log('Conductor creado:', driver);

        if (dto.contacts && dto.contacts.length > 0) {
          console.log('Creando contactos...');
          await tx.contact.createMany({
            data: dto.contacts.map((c) => ({
              driverId: driver.id,
              type: c.type,
              value: c.value,
            })),
          });
        }

        console.log('Buscando conductor completo...');
        const result = await tx.driver.findUnique({
          where: { id: driver.id },
          include: {
            address: true,
            contacts: true,
            documents: true,
          },
        });
        console.log('Conductor completo encontrado:', result);
        return result;
      });
    } catch (error) {
      console.error('Error en create service:', error);
      throw error;
    }
  }

  async findAll(params: {
    teamId: string;
    status?: string;
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where: any = { teamId: params.teamId };

    if (params.status) {
      where.status = params.status.toUpperCase();
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { licenseNumber: { contains: params.search, mode: 'insensitive' } },
        { curp: { contains: params.search, mode: 'insensitive' } },
        { rfc: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          contacts: true,
          documents: true,
        },
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
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        address: true,
        contacts: true,
        documents: true,
      },
    });

    if (!driver) {
      throw new NotFoundException('Conductor no encontrado');
    }

    return driver;
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id); // valida existencia

    return this.prisma.$transaction(async (tx) => {
      // Actualizar dirección si se proporciona
      if (dto.address) {
        const driver = await tx.driver.findUnique({
          where: { id },
          include: { address: true },
        });

        if (!driver) {
          throw new NotFoundException('Conductor no encontrado');
        }

        await tx.address.update({
          where: { id: driver.addressId },
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
      }

      // Actualizar conductor
      const updatedDriver = await tx.driver.update({
        where: { id },
        data: {
          name: dto.name,
          photoUrl: dto.photoUrl,
          licenseNumber: dto.licenseNumber,
          status: dto.status,
          curp: dto.curp,
          rfc: dto.rfc,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
          medicalExpiry: dto.medicalExpiry ? new Date(dto.medicalExpiry) : null,
          emergencyContact: dto.emergencyContact,
          bloodType: dto.bloodType,
          allergies: dto.allergies,
          specialNotes: dto.specialNotes,
          experience: dto.experience,
          certifications: dto.certifications,
          salary: dto.salary,
          paymentMethod: dto.paymentMethod,
          bankAccount: dto.bankAccount,
        },
      });

      // Actualizar contactos si se proporcionan
      if (dto.contacts) {
        // Eliminar contactos existentes
        await tx.contact.deleteMany({
          where: { driverId: id },
        });

        // Crear nuevos contactos
        if (dto.contacts.length > 0) {
          await tx.contact.createMany({
            data: dto.contacts.map((contact) => ({
              driverId: id,
              type: contact.type,
              value: contact.value,
            })),
          });
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    await this.findOne(id); // valida existencia

    // En lugar de eliminar, solo cambiar el status a DESACTIVADO
    return this.prisma.driver.update({
      where: { id },
      data: { status: 'DESACTIVADO' },
      include: {
        address: true,
        contacts: true,
        documents: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: 'DISPONIBLE' | 'EN_VIAJE' | 'DESACTIVADO',
  ) {
    await this.findOne(id); // valida existencia

    return this.prisma.driver.update({
      where: { id },
      data: { status },
      include: {
        address: true,
        contacts: true,
        documents: true,
      },
    });
  }

  async getPaginatedDrivers(
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
          { licenseNumber: { contains: search, mode: 'insensitive' } },
          { curp: { contains: search, mode: 'insensitive' } },
          { rfc: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(teamId && { teamId }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          address: true,
          contacts: true,
          documents: true,
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
