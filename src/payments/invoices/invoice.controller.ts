import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard';
import { RolesGuard } from '../../utils/guards/roles.guard';
import { Roles } from '../../utils/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { InvoiceService } from './invoice.service';
import { Auth } from '@/utils/decorators/auth.decorator';

@Controller('invoice')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Auth()
  async findAll(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('teamId') teamId: string,
  ) {
    return this.invoiceService.findAll(teamId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post('create-from-trip/:tripId')
  @Auth()
  async createFromTrip(@Param('tripId') tripId: string) {
    return this.invoiceService.createInvoiceFromTrip(tripId);
  }

  @Post(':id/stamp')
  @Auth()
  async stampInvoice(@Param('id') id: string) {
    return this.invoiceService.stampInvoice(id);
  }

  @Post(':id/cancel')
  @Auth()
  async cancelInvoice(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.invoiceService.cancelInvoice(id, body.reason || '01');
  }
}
