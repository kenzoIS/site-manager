import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class VolunteerRolesService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  async findAll(campaignId?: string, status?: string) {
    let query = this.db
      .from('volunteer_roles')
      .select(
        `
        *,
        bh_campaigns!volunteer_roles_campaign_id_fkey(id, title, type, status),
        volunteer_applications(id, status)
      `,
      )
      .order('start_date', { ascending: true });

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('volunteer_roles')
      .select(
        `
        *,
        bh_campaigns!volunteer_roles_campaign_id_fkey(id, title, type, status, org_id),
        volunteer_applications(
          id, status, applied_at,
          user_profiles!volunteer_applications_volunteer_auth_id_fkey(
            id, first_name, last_name, profile_photo_key
          )
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Volunteer role ${id} not found`);
    return data;
  }
}
