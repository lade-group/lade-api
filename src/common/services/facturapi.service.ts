import { Injectable, Logger } from '@nestjs/common';
import { facturapiConfig } from '../../config/facturapi.config';

interface FacturapiCustomer {
  legal_name: string;
  email: string;
  tax_id: string;
  tax_system: string;
  address: {
    zip: string;
    street?: string;
    exterior?: string;
    interior?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface FacturapiProduct {
  description: string;
  product_key: string;
  price: number;
  taxes: Array<{
    type: string;
    rate: number;
  }>;
}

interface FacturapiInvoice {
  customer: FacturapiCustomer;
  items: Array<{
    quantity: number;
    product: FacturapiProduct;
  }>;
  use: string;
  payment_form: string;
  payment_method?: string;
  conditions?: string;
  pdf_custom_section?: string;
}

interface FacturapiOrganization {
  name: string;
  tax_id: string;
  tax_system: string;
  address: {
    zip: string;
    street?: string;
    exterior?: string;
    interior?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

@Injectable()
export class FacturapiService {
  private readonly logger = new Logger(FacturapiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = facturapiConfig.apiUrl;
    this.apiKey = facturapiConfig.apiKey;
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    data?: any,
  ) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Facturapi API error: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Facturapi API error: ${response.status} - ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error making request to Facturapi: ${error.message}`);
      throw error;
    }
  }

  // Organizaciones
  async createOrganization(orgData: FacturapiOrganization) {
    return this.makeRequest('/organizations', 'POST', orgData);
  }

  async getOrganization(orgId: string) {
    return this.makeRequest(`/organizations/${orgId}`);
  }

  async updateOrganization(
    orgId: string,
    orgData: Partial<FacturapiOrganization>,
  ) {
    return this.makeRequest(`/organizations/${orgId}`, 'PUT', orgData);
  }

  // Clientes
  async createCustomer(customerData: FacturapiCustomer) {
    return this.makeRequest('/customers', 'POST', customerData);
  }

  async getCustomer(customerId: string) {
    return this.makeRequest(`/customers/${customerId}`);
  }

  async updateCustomer(
    customerId: string,
    customerData: Partial<FacturapiCustomer>,
  ) {
    return this.makeRequest(`/customers/${customerId}`, 'PUT', customerData);
  }

  async validateCustomerTaxId(taxId: string) {
    return this.makeRequest(`/customers/tax_id_validation/${taxId}`);
  }

  // Facturas
  async createInvoice(invoiceData: FacturapiInvoice) {
    return this.makeRequest('/invoices', 'POST', invoiceData);
  }

  async getInvoice(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}`);
  }

  async cancelInvoice(invoiceId: string, reason: string = '01') {
    return this.makeRequest(`/invoices/${invoiceId}/cancel`, 'POST', {
      reason,
    });
  }

  async downloadInvoicePdf(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}/pdf`);
  }

  async downloadInvoiceXml(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}/xml`);
  }

  // Productos
  async createProduct(productData: FacturapiProduct) {
    return this.makeRequest('/products', 'POST', productData);
  }

  async getProduct(productId: string) {
    return this.makeRequest(`/products/${productId}`);
  }

  async updateProduct(
    productId: string,
    productData: Partial<FacturapiProduct>,
  ) {
    return this.makeRequest(`/products/${productId}`, 'PUT', productData);
  }

  // Catálogos
  async getTaxSystems() {
    return this.makeRequest('/catalogs/tax_systems');
  }

  async getPaymentForms() {
    return this.makeRequest('/catalogs/payment_forms');
  }

  async getCfdiUses() {
    return this.makeRequest('/catalogs/cfdi_uses');
  }

  async getProductKeys() {
    return this.makeRequest('/catalogs/product_keys');
  }
}
