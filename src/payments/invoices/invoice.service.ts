import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FacturapiService } from '../../common/services/facturapi.service';
import { DmsService } from '../../infraestructure/S3/s3.service';
import { InvoiceStatus } from '@prisma/client';
import { facturapiConfig } from '../../config/facturapi.config';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private facturapiService: FacturapiService,
    private s3Service: DmsService,
  ) {}

  async createInvoiceFromTrip(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        team: {
          include: {
            fiscalData: true,
            address: true,
          },
        },
        client: {
          include: {
            address: true,
          },
        },
        cargos: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (!trip.team.fiscalData) {
      this.logger.warn(
        `Team ${trip.teamId} does not have fiscal data configured. Invoice will be created as draft.`,
      );
      // No lanzar error, continuar con la creación de la factura como borrador
    }

    // Verificar si ya existe una factura para este viaje
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { tripId },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this trip');
    }

    // Crear la factura en la base de datos
    const invoice = await this.prisma.invoice.create({
      data: {
        tripId,
        teamId: trip.teamId,
        subtotal: trip.price,
        taxAmount: trip.price * 0.16, // IVA 16%
        total: trip.price * 1.16,
        status: InvoiceStatus.DRAFT,
      },
    });

    this.logger.log(`Created invoice ${invoice.id} for trip ${tripId}`);
    return invoice;
  }

  async stampInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        trip: {
          include: {
            team: {
              include: {
                fiscalData: true,
                address: true,
              },
            },
            client: {
              include: {
                address: true,
              },
            },
            cargos: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Invoice is not in draft status');
    }

    try {
      // Actualizar estado a pendiente
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.PENDING },
      });

      // Preparar datos para Facturapi
      const facturapiInvoice = this.prepareFacturapiInvoice(invoice);

      // Crear factura en Facturapi
      const facturapiResponse =
        await this.facturapiService.createInvoice(facturapiInvoice);

      // Descargar archivos
      const pdfBuffer = await this.downloadInvoiceFile(
        facturapiResponse.id,
        'pdf',
      );
      const xmlBuffer = await this.downloadInvoiceFile(
        facturapiResponse.id,
        'xml',
      );

      // Subir archivos a S3 usando el método directo
      const pdfKey = `invoices/${invoiceId}/invoice.pdf`;
      const xmlKey = `invoices/${invoiceId}/invoice.xml`;

      // Subir archivos directamente
      const pdfUrl = await this.s3Service.uploadFile(
        pdfKey,
        pdfBuffer,
        'application/pdf',
      );
      const xmlUrl = await this.s3Service.uploadFile(
        xmlKey,
        xmlBuffer,
        'application/xml',
      );

      // Actualizar factura con datos de Facturapi
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.STAMPED,
          facturapiInvoiceId: facturapiResponse.id,
          facturapiPdfUrl: facturapiResponse.pdf_url,
          facturapiXmlUrl: facturapiResponse.xml_url,
          localPdfUrl: pdfUrl,
          localXmlUrl: xmlUrl,
          invoiceNumber: facturapiResponse.number,
          folio: facturapiResponse.folio,
          uuid: facturapiResponse.uuid,
        },
      });

      this.logger.log(`Successfully stamped invoice ${invoiceId}`);
      return await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          trip: {
            include: {
              team: true,
              client: true,
            },
          },
        },
      });
    } catch (error) {
      // Revertir estado en caso de error
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.ERROR },
      });

      this.logger.error(
        `Error stamping invoice ${invoiceId}: ${error.message}`,
      );
      throw error;
    }
  }

  private prepareFacturapiInvoice(invoice: any) {
    const { trip, team, client } = invoice;

    // Preparar cliente para Facturapi
    const customer = {
      legal_name: client.name,
      email: client.email,
      tax_id: client.rfc,
      tax_system: client.taxRegime,
      address: {
        zip: client.address.postal_code,
        street: client.address.street,
        exterior: client.address.exterior_number,
        interior: client.address.interior_number,
        neighborhood: client.address.neighborhood,
        city: client.address.city,
        state: client.address.state,
        country: client.address.country,
      },
    };

    // Preparar productos (cargos)
    const items = trip.cargos.map((cargo: any) => ({
      quantity: 1,
      product: {
        description: cargo.name,
        product_key: team.fiscalData.defaultProductKey,
        price: trip.price / trip.cargos.length, // Distribuir precio entre cargos
        taxes: [
          {
            type: 'IVA',
            rate: 0.16,
          },
        ],
      },
    }));

    // Si no hay cargos, crear un item por defecto
    if (items.length === 0) {
      items.push({
        quantity: 1,
        product: {
          description: team.fiscalData.defaultProductDescription,
          product_key: team.fiscalData.defaultProductKey,
          price: trip.price,
          taxes: [
            {
              type: 'IVA',
              rate: 0.16,
            },
          ],
        },
      });
    }

    // Sección personalizada del PDF con información del viaje
    const pdfCustomSection = `
      <h3>Información del Viaje</h3>
      <p><strong>Conductor:</strong> ${trip.driver.name}</p>
      <p><strong>Vehículo:</strong> ${trip.vehicle.plate} - ${trip.vehicle.brand} ${trip.vehicle.model}</p>
      <p><strong>Ruta:</strong> ${trip.route.name}</p>
      <p><strong>Fecha de inicio:</strong> ${new Date(trip.startDate).toLocaleDateString()}</p>
      <p><strong>Fecha de fin:</strong> ${new Date(trip.endDate).toLocaleDateString()}</p>
      ${trip.notes ? `<p><strong>Notas:</strong> ${trip.notes}</p>` : ''}
    `;

    return {
      customer,
      items,
      use: team.fiscalData.defaultCfdiUse,
      payment_form: team.fiscalData.defaultPaymentForm,
      payment_method: team.fiscalData.defaultPaymentMethod,
      pdf_custom_section: pdfCustomSection,
    };
  }

  private async downloadInvoiceFile(
    invoiceId: string,
    type: 'pdf' | 'xml',
  ): Promise<Buffer> {
    try {
      const response = await fetch(
        `${facturapiConfig.apiUrl}/invoices/${invoiceId}/${type}`,
        {
          headers: {
            Authorization: `Bearer ${facturapiConfig.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to download ${type}: ${response.status}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      this.logger.error(
        `Error downloading ${type} for invoice ${invoiceId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findAll(teamId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { teamId },
        include: {
          trip: {
            include: {
              client: true,
              driver: true,
              vehicle: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({
        where: { teamId },
      }),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            team: {
              include: {
                fiscalData: true,
              },
            },
            client: {
              include: {
                address: true,
              },
            },
            driver: true,
            vehicle: true,
            route: true,
            cargos: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async cancelInvoice(id: string, reason: string = '01') {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.STAMPED) {
      throw new BadRequestException('Only stamped invoices can be cancelled');
    }

    try {
      // Cancelar en Facturapi
      if (invoice.facturapiInvoiceId) {
        await this.facturapiService.cancelInvoice(
          invoice.facturapiInvoiceId,
          reason,
        );
      }

      // Actualizar en base de datos
      await this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      return { message: 'Invoice cancelled successfully' };
    } catch (error) {
      this.logger.error(`Error cancelling invoice ${id}: ${error.message}`);
      throw error;
    }
  }
}
