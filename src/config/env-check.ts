import { ConfigService } from '@nestjs/config';

export function checkS3EnvironmentVariables() {
  const config = new ConfigService();

  console.log('=== S3 Environment Variables Check ===');

  // Variables estándar de AWS
  console.log('\n--- AWS S3 Variables ---');
  console.log(
    'AWS_S3_BUCKET_NAME:',
    config.get('AWS_S3_BUCKET_NAME') ? '✅ Set' : '❌ Not set',
  );
  console.log(
    'AWS_ACCESS_KEY_ID:',
    config.get('AWS_ACCESS_KEY_ID') ? '✅ Set' : '❌ Not set',
  );
  console.log(
    'AWS_SECRET_ACCESS_KEY:',
    config.get('AWS_SECRET_ACCESS_KEY') ? '✅ Set' : '❌ Not set',
  );
  console.log(
    'AWS_REGION:',
    config.get('AWS_REGION') ? '✅ Set' : '❌ Not set',
  );

  console.log('\n=== End Check ===');
}
