import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Auth } from '@/utils/decorators/auth.decorator';
import { DmsService } from '@/infraestructure/S3/s3.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Driver Documents')
@Controller('driver-documents')
export class DriverDocumentsController {
  constructor(
    private readonly s3Service: DmsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload-url')
  @Auth()
  @ApiOperation({ summary: 'Generar URL para subir documento de conductor' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', example: 'licencia.pdf' },
        contentType: { type: 'string', example: 'application/pdf' },
        driverId: { type: 'string', example: 'driver-uuid' },
        documentType: { type: 'string', example: 'LICENSE' },
      },
      required: ['fileName', 'contentType', 'driverId', 'documentType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'URL de subida generada exitosamente',
  })
  async generateUploadUrl(
    @Body()
    body: {
      fileName: string;
      contentType: string;
      driverId: string;
      documentType: string;
    },
  ) {
    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File upload service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Validar que el conductor existe
    const driver = await this.prisma.driver.findUnique({
      where: { id: body.driverId },
    });

    if (!driver) {
      throw new HttpException('Conductor no encontrado', HttpStatus.NOT_FOUND);
    }

    // Validar tipo de archivo
    const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    if (!this.s3Service.validateFileType(body.fileName, allowedTypes)) {
      throw new HttpException(
        'Tipo de archivo no permitido',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generar clave única para el archivo
    const key = this.s3Service.generateFileKey(
      'driver-documents',
      body.fileName,
      body.driverId,
    );

    // Generar URL de subida
    const { uploadUrl, key: fileKey } = await this.s3Service.generateUploadUrl(
      key,
      body.contentType,
    );

    return {
      uploadUrl,
      key: fileKey,
      expiresIn: 3600,
    };
  }

  @Post(':driverId/documents')
  @Auth()
  @ApiOperation({ summary: 'Registrar documento subido en la base de datos' })
  @ApiParam({ name: 'driverId', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Licencia de Conducir' },
        type: { type: 'string', example: 'LICENSE' },
        key: {
          type: 'string',
          example: 'driver-documents/driver-uuid/1234567890-abc123.pdf',
        },
        fileName: { type: 'string', example: 'licencia.pdf' },
        fileSize: { type: 'number', example: 1024000 },
        mimeType: { type: 'string', example: 'application/pdf' },
        isRequired: { type: 'boolean', example: true },
        expiresAt: { type: 'string', example: '2025-12-31' },
      },
      required: ['name', 'type', 'key', 'fileName', 'fileSize', 'mimeType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento registrado exitosamente',
  })
  async registerDocument(
    @Param('driverId') driverId: string,
    @Body()
    body: {
      name: string;
      type: string;
      key: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      isRequired?: boolean;
      expiresAt?: string;
    },
  ) {
    // Validar que el conductor existe
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new HttpException('Conductor no encontrado', HttpStatus.NOT_FOUND);
    }

    // Crear registro del documento
    const document = await this.prisma.driverDocument.create({
      data: {
        driverId,
        name: body.name,
        type: body.type,
        url: body.key, // Guardamos la key como URL
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        isRequired: body.isRequired ?? true,
        isVerified: false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return document;
  }

  @Get(':driverId/documents')
  @Auth()
  @ApiOperation({ summary: 'Obtener documentos de un conductor' })
  @ApiParam({ name: 'driverId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Documentos obtenidos exitosamente',
  })
  async getDriverDocuments(@Param('driverId') driverId: string) {
    const documents = await this.prisma.driverDocument.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });

    // Si S3 no está configurado, devolver documentos sin URLs de descarga
    if (!this.s3Service.isServiceConfigured()) {
      return documents.map((doc) => ({
        ...doc,
        downloadUrl: null,
        message: 'File download service is not configured',
      }));
    }

    // Generar URLs de descarga para cada documento
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          const downloadUrl = await this.s3Service.generateDownloadUrl(doc.url);
          return {
            ...doc,
            downloadUrl,
          };
        } catch (error) {
          return {
            ...doc,
            downloadUrl: null,
            error: 'Failed to generate download URL',
          };
        }
      }),
    );

    return documentsWithUrls;
  }

  @Get('download/:documentId')
  @Auth()
  @ApiOperation({
    summary: 'Obtener URL de descarga para un documento específico',
  })
  @ApiParam({ name: 'documentId', required: true })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga generada exitosamente',
  })
  async getDownloadUrl(@Param('documentId') documentId: string) {
    const document = await this.prisma.driverDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Documento no encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File download service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const downloadUrl = await this.s3Service.generateDownloadUrl(document.url);

    return {
      downloadUrl,
      document,
    };
  }

  @Delete(':documentId')
  @Auth()
  @ApiOperation({ summary: 'Eliminar documento de conductor' })
  @ApiParam({ name: 'documentId', required: true })
  @ApiResponse({ status: 200, description: 'Documento eliminado exitosamente' })
  async deleteDocument(@Param('documentId') documentId: string) {
    const document = await this.prisma.driverDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Documento no encontrado', HttpStatus.NOT_FOUND);
    }

    // Si S3 está configurado, eliminar el archivo
    if (this.s3Service.isServiceConfigured()) {
      try {
        await this.s3Service.deleteFile(document.url);
      } catch (error) {
        console.warn('Failed to delete file from S3:', error);
        // Continuar con la eliminación del registro aunque falle S3
      }
    }

    // Eliminar registro de la base de datos
    await this.prisma.driverDocument.delete({
      where: { id: documentId },
    });

    return { message: 'Documento eliminado exitosamente' };
  }

  @Post(':documentId/verify')
  @Auth()
  @ApiOperation({ summary: 'Marcar documento como verificado' })
  @ApiParam({ name: 'documentId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Documento marcado como verificado',
  })
  async verifyDocument(@Param('documentId') documentId: string) {
    const document = await this.prisma.driverDocument.update({
      where: { id: documentId },
      data: { isVerified: true },
    });

    return document;
  }
}
