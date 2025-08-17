import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    try {
      console.log('Iniciando creación de cliente con DTO:', dto);

      return this.prisma.$transaction(async (tx) => {
        console.log('Creando dirección...');
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
        console.log('Dirección creada:', address);

        console.log('Creando cliente...');
        const client = await tx.client.create({
          data: {
            name: dto.name,
            name_related: dto.name_related,
            description: dto.description,
            rfc: dto.rfc,
            email: dto.email,
            phone: dto.phone,
            cfdiUse: dto.cfdiUse,
            taxRegime: dto.taxRegime,
            zipCode: dto.zipCode,
            teamId: dto.teamId,
            status: dto.status || 'ACTIVE',
            addressId: address.id,
            creditLimit: dto.creditLimit,
            paymentTerms: dto.paymentTerms,
            preferredPaymentMethod: dto.preferredPaymentMethod,
            businessType: dto.businessType,
            industry: dto.industry,
            specialRequirements: dto.specialRequirements,
            notes: dto.notes,
          },
        });
        console.log('Cliente creado:', client);

        // Crear contactos si se proporcionan
        if (dto.contacts && dto.contacts.length > 0) {
          console.log('Creando contactos...');
          await Promise.all(
            dto.contacts.map((contact) =>
              tx.contact.create({
                data: {
                  type: contact.type,
                  value: contact.value,
                  clientId: client.id,
                },
              }),
            ),
          );
        }

        console.log('Buscando cliente completo...');
        const result = await tx.client.findUnique({
          where: { id: client.id },
          include: {
            address: true,
            contacts: true,
          },
        });
        console.log('Cliente completo encontrado:', result);
        return result;
      });
    } catch (error) {
      console.error('Error en create service:', error);
      throw error;
    }
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
    await this.findById(id); // valida existencia

    return this.prisma.$transaction(async (tx) => {
      // Actualizar dirección si se proporciona
      if (dto.address) {
        const client = await tx.client.findUnique({
          where: { id },
          include: { address: true },
        });

        if (!client) {
          throw new NotFoundException('Cliente no encontrado');
        }

        await tx.address.update({
          where: { id: client.addressId },
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

      // Actualizar cliente
      const updatedClient = await tx.client.update({
        where: { id },
        data: {
          name: dto.name,
          name_related: dto.name_related,
          description: dto.description,
          rfc: dto.rfc,
          email: dto.email,
          phone: dto.phone,
          cfdiUse: dto.cfdiUse,
          taxRegime: dto.taxRegime,
          zipCode: dto.zipCode,
          creditLimit: dto.creditLimit,
          paymentTerms: dto.paymentTerms,
          preferredPaymentMethod: dto.preferredPaymentMethod,
          businessType: dto.businessType,
          industry: dto.industry,
          specialRequirements: dto.specialRequirements,
          notes: dto.notes,
        },
      });

      // Actualizar contactos si se proporcionan
      if (dto.contacts) {
        // Eliminar contactos existentes
        await tx.contact.deleteMany({
          where: { clientId: id },
        });

        // Crear nuevos contactos
        if (dto.contacts.length > 0) {
          await Promise.all(
            dto.contacts.map((contact) =>
              tx.contact.create({
                data: {
                  type: contact.type,
                  value: contact.value,
                  clientId: id,
                },
              }),
            ),
          );
        }
      }

      return this.findById(id);
    });
  }

  async remove(id: string) {
    await this.findById(id); // valida existencia

    // En lugar de eliminar, solo cambiar el status a CANCELLED
    return this.prisma.client.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        address: true,
        contacts: true,
      },
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'CANCELLED' | 'DELETED') {
    await this.findById(id); // valida existencia

    return this.prisma.client.update({
      where: { id },
      data: { status },
      include: {
        address: true,
        contacts: true,
      },
    });
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
