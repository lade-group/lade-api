import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getS3Config } from '../../config/s3.config';

@Injectable()
export class DmsService {
  private client: S3Client | null;
  private bucketName: string;

  constructor(private config: ConfigService) {
    try {
      const s3Config = getS3Config(this.config);

      this.client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      });

      this.bucketName = s3Config.bucketName;
      console.log(
        'DmsService initialized successfully with bucket:',
        this.bucketName,
      );
    } catch (error) {
      console.error('Failed to initialize DmsService:', error.message);
      // No lanzar error, permitir que la aplicación continúe sin S3
      this.client = null;
      this.bucketName = '';
    }
  }

  async uploadSingleFile({
    file,
    isPublic = true,
    customKey,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
    customKey?: string;
  }) {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    try {
      const key = customKey || `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      });

      const uploadResult = await this.client.send(command);
      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getPresignedSignedUrl(key)).url,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async getPresignedSignedUrl(key: string) {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteFile(key: string) {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    try {
      console.log('Deleting file from bucket:', this.bucketName);
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // Métodos adicionales para el componente FileUpload
  isServiceConfigured(): boolean {
    try {
      getS3Config(this.config);
      return true;
    } catch (error) {
      return false;
    }
  }

  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.toLowerCase().split('.').pop();
    return allowedTypes.includes(extension || '');
  }

  generateFileKey(folder: string, fileName: string, entityId?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();

    if (entityId) {
      return `${folder}/${entityId}/${timestamp}-${randomString}.${extension}`;
    }

    return `${folder}/${timestamp}-${randomString}.${extension}`;
  }

  async generateUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    });

    return {
      uploadUrl,
      key,
    };
  }

  async generateDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn,
    });
  }

  /**
   * Sube un archivo directamente a S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    if (!this.client) {
      throw new InternalServerErrorException('S3 service is not configured');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.client.send(command);

      // Retornar URL pública directa
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Obtiene el nombre del bucket
   */
  getBucketName(): string {
    return this.bucketName;
  }
}
