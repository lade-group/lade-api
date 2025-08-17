export const facturapiConfig = {
  apiKey: process.env.FACTURAPI_API_KEY || '',
  apiUrl: process.env.FACTURAPI_API_URL || 'https://www.facturapi.io/v2',
  s3Bucket: process.env.S3_INVOICE_BUCKET || 'invoices',
  s3Region: process.env.S3_REGION || 'us-east-1',
};

export const validateFacturapiConfig = () => {
  if (!facturapiConfig.apiKey) {
    throw new Error('FACTURAPI_API_KEY is required');
  }
  return true;
};
