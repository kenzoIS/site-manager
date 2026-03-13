import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';

@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly service: UserProfilesService) {}

  @Get()
  findAll(@Query('role') role?: string) {
    return this.service.findAll(role);
  }

  /** GET /api/user-profiles/donors — donor applicant list */
  @Get('donors')
  getDonors() {
    return this.service.getDonors();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':photoKey/photo')
  getProfilePhoto(@Param('photoKey') photoKey: string) {
    return this.service.getProfilePhoto(photoKey);
  }
}
