import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ApplicationStatus,
  FilterApplicationsDto,
  RejectDocumentsDto,
} from './dto/application.dto';

@Injectable()
export class VolunteerApplicationsService {
  private readonly logger = new Logger(VolunteerApplicationsService.name);

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  private get db() {
    return this.supabase.getClient();
  }

  // ─── List / Filter ───────────────────────────────────────────────────────────

  async findAll(filters: FilterApplicationsDto) {
    let query = this.db
      .from('volunteer_applications')
      .select(
        `
        *,
        user_profiles!volunteer_applications_volunteer_auth_id_fkey(
          id, first_name, last_name, phone, barangay, municipality, province,
          profile_photo_key, role
        ),
        volunteer_roles!volunteer_applications_role_id_fkey(
          id, title, description, location, start_date, end_date
        ),
        bh_campaigns!volunteer_applications_campaign_id_fkey(
          id, title, type, org_id
        )
      `,
      )
      .order('applied_at', { ascending: false });

    if (filters.role_id) query = query.eq('role_id', filters.role_id);
    if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    // Client-side search filter on name
    let results = data ?? [];
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
    const { data, error } = await this.db
      .from('volunteer_applications')
      .select(
        `
        *,
        user_profiles!volunteer_applications_volunteer_auth_id_fkey(
          id, auth_user_id, first_name, last_name, phone, address,
          barangay, municipality, province, profile_photo_key, role, created_at
        ),
        volunteer_roles!volunteer_applications_role_id_fkey(
          id, title, description, requirements, slots_total, slots_filled,
          location, start_date, end_date, status
        ),
        bh_campaigns!volunteer_applications_campaign_id_fkey(
          id, title, description, type, target_amount, current_amount,
          start_date, end_date, org_id, status
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Application ${id} not found`);

    // Generate signed URL for the resume document stored in Supabase bucket
    let resumeSignedUrl: string | null = null;
    if (data.resume_key) {
      resumeSignedUrl = await this.supabase.getSignedUrl('resumes', data.resume_key);
    }

    // Check if this volunteer is also a donor
    const profile = data.user_profiles as any;
    let isAlsoDonor = false;
    if (profile?.auth_user_id) {
      const { count } = await this.db
        .from('donations')
        .select('id', { count: 'exact', head: true })
        .eq('donor_auth_id', profile.auth_user_id);
      isAlsoDonor = (count ?? 0) > 0;
    }

    return { ...data, resume_signed_url: resumeSignedUrl, is_also_donor: isAlsoDonor };
  }

  // ─── Review Workflow Actions ──────────────────────────────────────────────

  /** Step 1-No: Documents are invalid — reject and notify the applicant via Facebook */
  async rejectDocuments(id: string, dto: RejectDocumentsDto) {
    const app = await this.findOne(id);

    const { error } = await this.db
      .from('volunteer_applications')
      .update({ status: ApplicationStatus.DOCUMENTS_REJECTED })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);

    // Send Facebook Messenger notification
    if (dto.facebook_psid) {
      await this.sendFacebookNotification(
        dto.facebook_psid,
        `Hi! We have reviewed your volunteer application for "${(app.volunteer_roles as any)?.title}". ` +
          `Unfortunately, we were unable to verify your submitted documents. Reason: ${dto.reason}. ` +
          `Please resubmit with valid documents. Thank you!`,
      );
    }

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

  // ─── Facebook Messenger Notification ─────────────────────────────────────

  private async sendFacebookNotification(psid: string, message: string) {
    const token = this.config.get<string>('FACEBOOK_PAGE_ACCESS_TOKEN');
    if (!token) {
      this.logger.warn('FACEBOOK_PAGE_ACCESS_TOKEN not set — skipping FB notification');
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: psid },
            message: { text: message },
            messaging_type: 'RESPONSE',
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Facebook notification failed: ${body}`);
      } else {
        this.logger.log(`Facebook notification sent to PSID ${psid}`);
      }
    } catch (err) {
      this.logger.error(`Facebook notification error: ${err}`);
    }
  }
}
