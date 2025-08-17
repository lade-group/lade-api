import { ConfigService } from '@nestjs/config';

export interface S3Config {
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export function getS3Config(configService: ConfigService): S3Config {
  // Usar las variables estándar de AWS
  let bucketName = configService.get<string>('AWS_S3_BUCKET_NAME') || configService.get<string>('S3_BUCKET_NAME');
  let accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID') || configService.get<string>('S3_ACCESS_KEY');
  let secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY') || configService.get<string>('S3_SECRET_ACCESS_KEY');
  let region = configService.get<string>('AWS_REGION') || configService.get<string>('S3_REGION') || 'us-east-1';

  if (!bucketName || !accessKeyId || !secretAccessKey || !region) {
    throw new Error(
      'S3 configuration is incomplete. Please check your environment variables. Required: AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION',
    );
  }

  return {
    bucketName,
    accessKeyId,
    secretAccessKey,
    region,
  };
}

export function validateS3Config(configService: ConfigService): boolean {
  try {
    getS3Config(configService);
    return true;
  } catch (error) {
    console.error('S3 configuration validation failed:', error.message);
    return false;
  }
}
