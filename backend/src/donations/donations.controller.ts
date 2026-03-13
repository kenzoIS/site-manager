import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
  constructor(private readonly service: DonationsService) {}

  @Get()
  findAll(
    @Query('campaign_id') campaignId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(campaignId, status);
  }

  /** GET /api/donations/inventory — aggregated donation inventory */
  @Get('inventory')
  getInventory(@Query('campaign_id') campaignId?: string) {
    return this.service.getInventory(campaignId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
