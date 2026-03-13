import { Module } from '@nestjs/common';
import { VolunteerApplicationsController } from './volunteer-applications.controller';
import { VolunteerApplicationsService } from './volunteer-applications.service';

@Module({
  controllers: [VolunteerApplicationsController],
  providers: [VolunteerApplicationsService],
})
export class VolunteerApplicationsModule {}
