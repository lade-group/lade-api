import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Auth } from '../../utils/decorators/auth.decorator';
import { TripService } from './trip.service';
import { JwtAuthGuard } from '../../utils/guards/jwt-auth.guard';
import { RolesGuard } from '../../utils/guards/roles.guard';
import { Roles } from '../../utils/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('trip')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @Auth()
  async findAll(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('teamId') teamId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    return this.tripService.findAll({
      skip,
      take: limitNum,
      teamId,
      search,
      status,
      userId: req.user.id,
    });
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.tripService.findOne(id, req.user.id);
  }

  @Post()
  @Auth()
  async create(@Body() createTripDto: any, @Request() req: any) {
    console.log('createTripDto', createTripDto);
    return this.tripService.create(createTripDto, req.user.id);
  }

  @Patch(':id/status')
  @Auth()
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
    @Request() req: any,
  ) {
    return this.tripService.updateStatus(
      id,
      updateStatusDto.status,
      req.user.id,
    );
  }

  @Put(':id')
  @Auth()
  async update(
    @Param('id') id: string,
    @Body() updateTripDto: any,
    @Request() req: any,
  ) {
    return this.tripService.update(id, updateTripDto, req.user.id);
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.tripService.remove(id, req.user.id);
  }
}
