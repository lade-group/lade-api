import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAddressDto, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.address.create({ data });
  }
}
