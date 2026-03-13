import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ActivateMissionDto {
  campaign_id: string;
  role_id: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
}

@Injectable()
export class MissionsService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** Activate a mission: assign deployed volunteers to the operation */
  async activateMission(dto: ActivateMissionDto, activatedBy: string) {
    // Fetch approved applications for this role
    const { data: applications, error: appError } = await this.db
      .from('volunteer_applications')
      .select('id, volunteer_auth_id')
      .eq('role_id', dto.role_id)
      .eq('status', 'approved');

    if (appError) throw new BadRequestException(appError.message);

    if (!applications || applications.length === 0) {
      return { success: true, deployments_created: 0, message: 'No approved volunteers for this role yet.' };
    }

    // Create deployment records for each approved volunteer
    const deploymentRecords = applications.map((app) => ({
      application_id: app.id,
      damayan_operation_id: dto.campaign_id,
      task_description: dto.notes ?? 'Mission activated by site manager',
      date_assigned: new Date().toISOString(),
      status: 'active',
    }));

    const { data, error } = await this.db
      .from('volunteer_deployments')
      .insert(deploymentRecords)
      .select();

    if (error) throw new BadRequestException(error.message);

    return { success: true, deployments_created: data?.length ?? 0, deployments: data };
  }

  /** Real-time volunteer summary for the current campaign */
  async getVolunteerSummary(campaignId?: string) {
    let query = this.db
      .from('volunteer_deployments')
      .select(
        `
        id, status, date_assigned, task_description,
        volunteer_applications!volunteer_deployments_application_id_fkey(
          id, volunteer_auth_id, status,
          user_profiles!volunteer_applications_volunteer_auth_id_fkey(
            id, first_name, last_name, profile_photo_key, barangay, municipality
          ),
          volunteer_roles!volunteer_applications_role_id_fkey(
            id, title, location
          )
        )
      `,
      )
      .order('date_assigned', { ascending: false });

    if (campaignId) {
      query = query.eq('damayan_operation_id', campaignId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    const deployments = data ?? [];

    // Build summary stats
    const total = deployments.length;
    const active = deployments.filter((d) => d.status === 'active').length;
    const completed = deployments.filter((d) => d.status === 'completed').length;

    // Group by role title
    const byRole: Record<string, number> = {};
    for (const d of deployments) {
      const app = d.volunteer_applications as any;
      const roleTitle = app?.volunteer_roles?.title ?? 'Unknown';
      byRole[roleTitle] = (byRole[roleTitle] ?? 0) + 1;
    }

    return {
      summary: { total, active, completed },
      by_role: byRole,
      deployments,
    };
  }
}
