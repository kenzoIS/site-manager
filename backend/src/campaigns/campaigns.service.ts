import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CampaignsService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  async findAll(type?: string, status?: string) {
    let query = this.db
      .from('bh_campaigns')
      .select(
        `
        *,
        organizations!bh_campaigns_org_id_fkey(id, name, type, contact_email),
        volunteer_roles(id, title, slots_total, slots_filled, status)
      `,
      )
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('bh_campaigns')
      .select(
        `
        *,
        organizations!bh_campaigns_org_id_fkey(id, name, type, contact_email, contact_phone, address, verified),
        volunteer_roles(id, title, description, requirements, slots_total, slots_filled, location, start_date, end_date, status),
        donations(id, amount, currency, status, donated_at)
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Campaign ${id} not found`);

    // Get signed URL for cover image
    let coverSignedUrl: string | null = null;
    if ((data as any).cover_image_key) {
      coverSignedUrl = await this.supabase.getSignedUrl('campaign-covers', (data as any).cover_image_key);
    }

    return { ...data, cover_signed_url: coverSignedUrl };
  }
}
