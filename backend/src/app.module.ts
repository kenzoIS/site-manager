import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { VolunteerApplicationsModule } from './volunteer-applications/volunteer-applications.module';
import { DonationsModule } from './donations/donations.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { VolunteerRolesModule } from './volunteer-roles/volunteer-roles.module';
import { MissionsModule } from './missions/missions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    UserProfilesModule,
    VolunteerApplicationsModule,
    DonationsModule,
    CampaignsModule,
    VolunteerRolesModule,
    MissionsModule,
  ],
})
export class AppModule {}
