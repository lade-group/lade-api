import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Delete,
  UseInterceptors,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { DmsService } from './s3.service';
import { Auth } from '@/utils/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('S3 File Management')
@Controller('dms')
export class DmsController {
  constructor(private readonly s3Service: DmsService) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: 5242880, // 10MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('isPublic') isPublic: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : false;

    // Generar clave única para el archivo
    const key = this.s3Service.generateFileKey('uploads', file.originalname);

    // Subir archivo usando el método del servicio
    const publicUrl = await this.s3Service.uploadFile(
      key,
      file.buffer,
      file.mimetype,
      { originalName: file.originalname },
    );

    return {
      url: publicUrl,
      key,
      isPublic: isPublicBool,
    };
  }

  @Post('/upload')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo a S3 con carpeta específica' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir',
        },
        folder: {
          type: 'string',
          enum: [
            'teams',
            'drivers-profile',
            'drivers-files',
            'clients-files',
            'vehicles-profile',
            'vehicles-files',
            'user-profiles',
          ],
          description: 'Carpeta donde guardar el archivo',
        },
        entityId: {
          type: 'string',
          description: 'ID de la entidad (opcional)',
        },
      },
      required: ['file', 'folder'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo subido exitosamente',
  })
  async uploadFileWithFolder(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf|doc|docx)' }),
          new MaxFileSizeValidator({
            maxSize: 10485760, // 10MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder: string,
    @Body('entityId') entityId?: string,
  ) {
    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File upload service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Validar carpeta
    const allowedFolders = [
      'teams',
      'drivers-profile',
      'drivers-files',
      'clients-files',
      'vehicles-profile',
      'vehicles-files',
      'user-profiles',
    ];
    if (!allowedFolders.includes(folder)) {
      throw new HttpException('Carpeta no válida', HttpStatus.BAD_REQUEST);
    }

    // Generar clave única para el archivo
    const key = this.s3Service.generateFileKey(
      folder,
      file.originalname,
      entityId,
    );

    // Subir archivo usando el método del servicio
    const publicUrl = await this.s3Service.uploadFile(
      key,
      file.buffer,
      file.mimetype,
      { originalName: file.originalname },
    );

    return {
      url: publicUrl,
      key: key,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    const publicUrl = `https://${this.s3Service.getBucketName()}.s3.amazonaws.com/${key}`;
    return { url: publicUrl };
  }

  @Get('/signed-url/:key')
  async getSingedUrl(@Param('key') key: string) {
    const signedUrl = await this.s3Service.generateDownloadUrl(key);
    return { url: signedUrl };
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  // Nuevos endpoints para el componente FileUpload
  @Post('s3/upload-url')
  @Auth()
  @ApiOperation({ summary: 'Generar URL para subir archivo a S3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', example: 'logo.png' },
        contentType: { type: 'string', example: 'image/png' },
        folder: {
          type: 'string',
          enum: [
            'teams',
            'drivers-profile',
            'drivers-files',
            'clients-files',
            'vehicles-profile',
            'vehicles-files',
            'user-profiles',
          ],
          example: 'teams',
        },
        entityId: { type: 'string', example: 'team-uuid' },
      },
      required: ['fileName', 'contentType', 'folder'],
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
      folder: string;
      entityId?: string;
    },
  ) {
    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File upload service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Validar carpeta
    const allowedFolders = [
      'teams',
      'drivers-profile',
      'drivers-files',
      'clients-files',
      'vehicles-profile',
      'vehicles-files',
      'user-profiles',
    ];
    if (!allowedFolders.includes(body.folder)) {
      throw new HttpException('Carpeta no válida', HttpStatus.BAD_REQUEST);
    }

    // Validar tipo de archivo según la carpeta
    const allowedTypes = this.getAllowedTypesForFolder(body.folder);
    if (!this.s3Service.validateFileType(body.fileName, allowedTypes)) {
      throw new HttpException(
        `Tipo de archivo no permitido para la carpeta ${body.folder}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generar clave única para el archivo
    const key = this.s3Service.generateFileKey(
      body.folder,
      body.fileName,
      body.entityId,
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

  @Post('s3/download-url')
  @Auth()
  @ApiOperation({ summary: 'Generar URL de descarga para archivo en S3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'teams/team-uuid/1234567890-logo.png' },
      },
      required: ['key'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga generada exitosamente',
  })
  async generateDownloadUrl(@Body() body: { key: string }) {
    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File download service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const downloadUrl = await this.s3Service.generateDownloadUrl(body.key);

    return {
      downloadUrl,
      expiresIn: 3600,
    };
  }

  @Delete('s3/delete')
  @Auth()
  @ApiOperation({ summary: 'Eliminar archivo de S3' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'teams/team-uuid/1234567890-logo.png' },
      },
      required: ['key'],
    },
  })
  @ApiResponse({ status: 200, description: 'Archivo eliminado exitosamente' })
  async deleteFileByKey(@Body() body: { key: string }) {
    // Verificar si S3 está configurado
    if (!this.s3Service.isServiceConfigured()) {
      throw new HttpException(
        'File deletion service is not configured. Please contact administrator.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      await this.s3Service.deleteFile(body.key);
      return { message: 'Archivo eliminado exitosamente' };
    } catch (error) {
      throw new HttpException(
        'Error al eliminar archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene los tipos de archivo permitidos según la carpeta
   */
  private getAllowedTypesForFolder(folder: string): string[] {
    switch (folder) {
      case 'teams':
        return ['jpg', 'jpeg', 'png', 'gif', 'svg'];
      case 'drivers-profile':
        return ['jpg', 'jpeg', 'png', 'gif'];
      case 'drivers-files':
        return ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
      case 'clients-files':
        return ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
      case 'vehicles-profile':
        return ['jpg', 'jpeg', 'png', 'gif'];
      case 'vehicles-files':
        return ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
      case 'user-profiles':
        return ['jpg', 'jpeg', 'png', 'gif'];
      default:
        return ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    }
  }
}
