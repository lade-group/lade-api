import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TripStatus, DriverStatus, VehicleStatus } from '@prisma/client';
import { InvoiceService } from '../../payments/invoices/invoice.service';

interface FindAllParams {
  skip: number;
  take: number;
  teamId: string;
  search?: string;
  status?: string;
  userId: string;
}

interface CreateTripDto {
  teamId: string;
  clientId: string;
  driverId: string;
  vehicleId: string;
  routeId: string;
  price: number;
  startDate: string;
  endDate: string;
  notes?: string;
  cargos?: Array<{
    name: string;
    weightKg: number;
    imageUrl?: string;
    notes?: string;
  }>;
}

@Injectable()
export class TripService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
  ) {}

  async findAll(params: FindAllParams) {
    const { skip, take, teamId, search, status, userId } = params;

    // Verificar que el usuario pertenece al equipo
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!userTeam) {
      throw new BadRequestException('Usuario no pertenece al equipo');
    }

    const where: any = {
      teamId,
    };

    if (search) {
      where.OR = [
        {
          client: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          driver: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          vehicle: {
            plate: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              name_related: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate: true,
              brand: true,
              model: true,
              imageUrl: true,
            },
          },
          route: {
            select: {
              id: true,
              name: true,
              code: true,
              stops: {
                include: {
                  point: {
                    include: {
                      address: true,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
          cargos: true,
          invoice: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
    };
  }

  async findOne(id: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        team: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            name_related: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            licenseNumber: true,
            status: true,
            address: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            type: true,
            imageUrl: true,
            status: true,
          },
        },
        route: {
          select: {
            id: true,
            name: true,
            code: true,
            company: true,
            stops: {
              include: {
                point: {
                  include: {
                    address: true,
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        cargos: true,
        invoice: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    return trip;
  }

  async create(createTripDto: CreateTripDto, userId: string) {
    const {
      teamId,
      clientId,
      driverId,
      vehicleId,
      routeId,
      cargos,
      ...tripData
    } = createTripDto;

    // Verificar que el usuario pertenece al equipo
    const userTeam = await this.prisma.usersOnTeams.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!userTeam) {
      throw new BadRequestException('Usuario no pertenece al equipo');
    }

    // Verificar que todos los recursos existen y pertenecen al equipo
    const [client, driver, vehicle, route] = await Promise.all([
      this.prisma.client.findFirst({
        where: { id: clientId, teamId },
      }),
      this.prisma.driver.findFirst({
        where: { id: driverId, teamId },
      }),
      this.prisma.vehicle.findFirst({
        where: { id: vehicleId, teamId },
      }),
      this.prisma.route.findFirst({
        where: { id: routeId, teamId },
      }),
    ]);

    if (!client || !driver || !vehicle || !route) {
      throw new BadRequestException('Uno o más recursos no encontrados');
    }

    // Verificar que el conductor y vehículo estén disponibles
    if (driver.status !== DriverStatus.DISPONIBLE) {
      throw new BadRequestException('El conductor no está disponible');
    }

    if (vehicle.status !== VehicleStatus.DISPONIBLE) {
      throw new BadRequestException('El vehículo no está disponible');
    }

    // Determinar el estatus inicial basado en la fecha
    const now = new Date();
    const startDate = new Date(tripData.startDate);
    let initialStatus: TripStatus = TripStatus.NO_INICIADO;

    if (startDate <= now) {
      initialStatus = TripStatus.EN_PROCESO;
    }

    // Crear el viaje y actualizar estatus de conductor y vehículo
    const result = await this.prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          teamId,
          clientId,
          driverId,
          vehicleId,
          routeId,
          status: initialStatus,
          cargos: cargos
            ? {
                create: cargos,
              }
            : undefined,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              name_related: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate: true,
              brand: true,
              model: true,
              imageUrl: true,
            },
          },
          route: {
            select: {
              id: true,
              name: true,
              code: true,
              stops: {
                include: {
                  point: {
                    include: {
                      address: true,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
          cargos: true,
          invoice: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      // Actualizar estatus de conductor y vehículo
      await Promise.all([
        prisma.driver.update({
          where: { id: driverId },
          data: { status: DriverStatus.EN_VIAJE },
        }),
        prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: VehicleStatus.EN_USO },
        }),
      ]);

      return trip;
    });

    // Crear factura automáticamente
    try {
      await this.invoiceService.createInvoiceFromTrip(result.id);
    } catch (error) {
      // Log el error pero no fallar la creación del viaje
      console.error('Error creating invoice for trip:', error.message);
    }

    return result;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        team: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    const newStatus = status as TripStatus;

    // Si el viaje se está finalizando, liberar conductor y vehículo
    if (
      (newStatus === TripStatus.FINALIZADO_A_TIEMPO ||
        newStatus === TripStatus.FINALIZADO_CON_RETRASO ||
        newStatus === TripStatus.CANCELADO) &&
      trip.status !== newStatus
    ) {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.trip.update({
          where: { id },
          data: { status: newStatus },
        });

        // Liberar conductor y vehículo
        await Promise.all([
          prisma.driver.update({
            where: { id: trip.driverId },
            data: { status: DriverStatus.DISPONIBLE },
          }),
          prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: VehicleStatus.DISPONIBLE },
          }),
        ]);
      });
    } else {
      await this.prisma.trip.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return { message: 'Estatus actualizado correctamente' };
  }

  async update(id: string, updateTripDto: any, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        team: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    // Solo permitir actualizar notas y cargos
    const { notes, cargos } = updateTripDto;

    const result = await this.prisma.trip.update({
      where: { id },
      data: {
        notes,
        cargos: cargos
          ? {
              deleteMany: {},
              create: cargos,
            }
          : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            name_related: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            imageUrl: true,
          },
        },
        route: {
          select: {
            id: true,
            name: true,
            code: true,
            stops: {
              include: {
                point: {
                  include: {
                    address: true,
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        cargos: true,
      },
    });

    return result;
  }

  async remove(id: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        team: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    // Solo cancelar el viaje, no eliminarlo
    await this.prisma.$transaction(async (prisma) => {
      await prisma.trip.update({
        where: { id },
        data: { status: TripStatus.CANCELADO },
      });

      // Liberar conductor y vehículo
      await Promise.all([
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.DISPONIBLE },
        }),
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.DISPONIBLE },
        }),
      ]);
    });

    return { message: 'Viaje cancelado correctamente' };
  }
}
