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

  /** Volunteer summary — shows all approved applications (standby/active/completed) */
  async getVolunteerSummary(campaignId?: string) {
    // If campaign filter, resolve role IDs for that campaign first
    let roleIdFilter: string[] | null = null;
    if (campaignId) {
      const { data: roles } = await this.db
        .from('volunteer_roles')
        .select('id')
        .eq('campaign_id', campaignId);
      roleIdFilter = (roles ?? []).map((r) => r.id);
      if (roleIdFilter.length === 0) {
        return { summary: { total: 0, active: 0, completed: 0 }, by_role: {}, deployments: [] };
      }
    }

    // Fetch all approved volunteer applications
    let appQuery = this.db
      .from('volunteer_applications')
      .select('*')
      .eq('status', 'approved')
      .order('applied_at', { ascending: false });
    if (roleIdFilter) appQuery = appQuery.in('role_id', roleIdFilter);

    const { data: applications, error: appErr } = await appQuery;
    if (appErr) throw new BadRequestException(appErr.message);
    const apps = applications ?? [];

    if (apps.length === 0) {
      return { summary: { total: 0, active: 0, completed: 0 }, by_role: {}, deployments: [] };
    }

    // Check volunteer_deployments to know who is actively deployed vs standby
    const appIds = apps.map((a) => a.id);
    const { data: deployments } = await this.db
      .from('volunteer_deployments')
      .select('application_id, status')
      .in('application_id', appIds);
    const deployedMap = new Map((deployments ?? []).map((d) => [d.application_id, d.status]));

    // Fetch profiles and roles in parallel
    const authIds = [...new Set(apps.map((a) => a.volunteer_auth_id).filter(Boolean))];
    const roleIds = [...new Set(apps.map((a) => a.role_id).filter(Boolean))];

    const [profilesRes, rolesRes] = await Promise.all([
      authIds.length
        ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, profile_photo_key, barangay, municipality').in('auth_user_id', authIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      roleIds.length
        ? this.db.from('volunteer_roles').select('id, title, location').in('id', roleIds)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);
    if (profilesRes.error) throw new BadRequestException(profilesRes.error.message);
    if (rolesRes.error) throw new BadRequestException(rolesRes.error.message);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.auth_user_id, p]));
    const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.id, r]));

    let active = 0;
    let completed = 0;
    const byRole: Record<string, number> = {};

    const enriched = apps.map((app) => {
      const deployStatus = deployedMap.get(app.id);
      const status = deployStatus === 'active' ? 'active'
        : deployStatus === 'completed' ? 'completed'
        : 'standby';
      if (status === 'active') active++;
      if (status === 'completed') completed++;

      const role = roleMap.get(app.role_id) as any;
      const roleTitle = role?.title ?? 'Unknown';
      byRole[roleTitle] = (byRole[roleTitle] ?? 0) + 1;

      return {
        id: app.id,
        status,
        application_id: app.id,
        date_assigned: null,
        task_description: role?.title ?? 'Assigned',
        damayan_operation_id: null,
        volunteer_applications: {
          ...app,
          user_profiles: profileMap.get(app.volunteer_auth_id) ?? null,
          volunteer_roles: role ?? null,
        },
      };
    });

    return { summary: { total: apps.length, active, completed }, by_role: byRole, deployments: enriched };
  }
}
