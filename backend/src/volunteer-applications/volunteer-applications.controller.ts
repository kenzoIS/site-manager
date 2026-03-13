import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VolunteerApplicationsService } from './volunteer-applications.service';
import { FilterApplicationsDto, RejectDocumentsDto } from './dto/application.dto';

@Controller('volunteer-applications')
export class VolunteerApplicationsController {
  constructor(private readonly service: VolunteerApplicationsService) {}

  /** GET /api/volunteer-applications — list with optional filters */
  @Get()
  findAll(@Query() filters: FilterApplicationsDto) {
    return this.service.findAll(filters);
  }

  /** GET /api/volunteer-applications/:id — single application with signed doc URL */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  /** PATCH /api/volunteer-applications/:id/reject-documents
   *  Step 1-No: Documents invalid → reject + notify via FB */
  @Patch(':id/reject-documents')
  rejectDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectDocumentsDto,
  ) {
    return this.service.rejectDocuments(id, dto);
  }

  /** PATCH /api/volunteer-applications/:id/approve-documents
   *  Step 1-Yes: Documents valid → mark verified */
  @Patch(':id/approve-documents')
  approveDocuments(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.approveDocuments(id);
  }

  /** PATCH /api/volunteer-applications/:id/reject-application
   *  Step 2-No: Reject the application */
  @Patch(':id/reject-application')
  rejectApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
  ) {
    return this.service.rejectApplication(id, body.reason);
  }

  /** PATCH /api/volunteer-applications/:id/approve-application
   *  Step 2-Yes: Approve the application */
  @Patch(':id/approve-application')
  approveApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reviewed_by: string },
  ) {
    return this.service.approveApplication(id, body.reviewed_by);
  }
}
