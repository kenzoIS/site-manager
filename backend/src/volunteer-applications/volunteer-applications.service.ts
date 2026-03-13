import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ApplicationStatus,
  FilterApplicationsDto,
  RejectDocumentsDto,
} from './dto/application.dto';

@Injectable()
export class VolunteerApplicationsService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  // ─── List / Filter ───────────────────────────────────────────────────────────

  async findAll(filters: FilterApplicationsDto) {
    // volunteer_applications has no campaign_id column — filter via volunteer_roles
    let roleIdFilter: string[] | null = null;
    if (filters.campaign_id) {
      const { data: roles, error: rErr } = await this.db
        .from('volunteer_roles')
        .select('id')
        .eq('campaign_id', filters.campaign_id);
      if (rErr) throw new BadRequestException(rErr.message);
      roleIdFilter = (roles ?? []).map((r) => r.id);
      if (roleIdFilter.length === 0) return [];
    }

    let query = this.db
      .from('volunteer_applications')
      .select('*')
      .order('applied_at', { ascending: false });
    if (filters.role_id) query = query.eq('role_id', filters.role_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (roleIdFilter) query = query.in('role_id', roleIdFilter);

    const { data: applications, error } = await query;
    if (error) throw new BadRequestException(error.message);
    const items = applications ?? [];
    if (items.length === 0) return [];

    // Enrich with user profiles and roles
    const authIds = [...new Set(items.map((a) => a.volunteer_auth_id).filter(Boolean))];
    const roleIds = [...new Set(items.map((a) => a.role_id).filter(Boolean))];

    const [profilesRes, rolesRes] = await Promise.all([
      authIds.length
        ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, barangay, municipality, province, profile_photo_key, role').in('auth_user_id', authIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      roleIds.length
        ? this.db.from('volunteer_roles').select('id, title, description, location, start_date, end_date').in('id', roleIds)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);
    if (profilesRes.error) throw new BadRequestException(profilesRes.error.message);
    if (rolesRes.error) throw new BadRequestException(rolesRes.error.message);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.auth_user_id, p]));
    const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.id, r]));

    let results = items.map((a) => ({
      ...a,
      user_profiles: profileMap.get(a.volunteer_auth_id) ?? null,
      volunteer_roles: roleMap.get(a.role_id) ?? null,
    }));

    // Client-side search filter on name
    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter((a) => {
        const profile = a.user_profiles as any;
        if (!profile) return false;
        const name = `${profile.first_name} ${profile.last_name}`.toLowerCase();
        return name.includes(term);
      });
    }

    return results;
  }

  // ─── Single Application with Signed Document URL ─────────────────────────

  async findOne(id: string) {
    const { data: app, error } = await this.db
      .from('volunteer_applications')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !app) throw new NotFoundException(`Application ${id} not found`);

    // Fetch profile and role in parallel
    const [profileRes, roleRes] = await Promise.all([
      app.volunteer_auth_id
        ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, address, barangay, municipality, province, profile_photo_key, role, created_at').eq('auth_user_id', app.volunteer_auth_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      app.role_id
        ? this.db.from('volunteer_roles').select('id, title, description, requirements, slots_total, slots_filled, location, start_date, end_date, status, campaign_id').eq('id', app.role_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Get campaign from role's campaign_id
    const role = roleRes.data as any;
    let campaign: any = null;
    if (role?.campaign_id) {
      const { data: c } = await this.db
        .from('bh_campaigns')
        .select('id, title, description, type, target_amount, current_amount, start_date, end_date, org_id, status')
        .eq('id', role.campaign_id)
        .maybeSingle();
      campaign = c;
    }

    // Signed URL for resume
    let resumeSignedUrl: string | null = null;
    if (app.resume_key) {
      resumeSignedUrl = await this.supabase.getSignedUrl('resumes', app.resume_key);
    }

    // Check if this volunteer is also a donor
    const profile = profileRes.data as any;
    let isAlsoDonor = false;
    if (profile?.auth_user_id) {
      const { count } = await this.db
        .from('donations')
        .select('id', { count: 'exact', head: true })
        .eq('donor_auth_id', profile.auth_user_id);
      isAlsoDonor = (count ?? 0) > 0;
    }

    return {
      ...app,
      user_profiles: profileRes.data ?? null,
      volunteer_roles: role ? { ...role, bh_campaigns: campaign } : null,
      bh_campaigns: campaign,
      resume_signed_url: resumeSignedUrl,
      is_also_donor: isAlsoDonor,
    };
  }

  // ─── Review Workflow Actions ──────────────────────────────────────────────

  /** Step 1-No: Documents are invalid — reject the document review */
  async rejectDocuments(id: string, dto: RejectDocumentsDto) {
    const { error } = await this.db
      .from('volunteer_applications')
      .update({ status: ApplicationStatus.DOCUMENTS_REJECTED })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);

    return { success: true, status: ApplicationStatus.DOCUMENTS_REJECTED };
  }

  /** Step 1-Yes: Documents are valid — mark verified and continue */
  async approveDocuments(id: string) {
    const app = await this.findOne(id);
    if (!app) throw new NotFoundException('Application not found');

    const { error } = await this.db
      .from('volunteer_applications')
      .update({ status: ApplicationStatus.DOCUMENTS_VALID })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);

    // Mark user profile as verified
    const profile = app.user_profiles as any;
    if (profile?.auth_user_id) {
      await this.db
        .from('user_profiles')
        .update({ role: 'verified_volunteer' })
        .eq('auth_user_id', profile.auth_user_id);
    }

    return { success: true, status: ApplicationStatus.DOCUMENTS_VALID };
  }

  /** Step 2-No: Reject the full application */
  async rejectApplication(id: string, reason: string) {
    const { error } = await this.db
      .from('volunteer_applications')
      .update({ status: ApplicationStatus.REJECTED })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true, status: ApplicationStatus.REJECTED };
  }

  /** Step 2-Yes: Approve the application */
  async approveApplication(id: string, reviewedBy: string) {
    const { error } = await this.db
      .from('volunteer_applications')
      .update({
        status: ApplicationStatus.APPROVED,
        reviewed_by: reviewedBy,
      })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true, status: ApplicationStatus.APPROVED };
  }
}
