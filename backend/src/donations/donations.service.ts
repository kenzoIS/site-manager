import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DonationsService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  async findAll(campaignId?: string, status?: string) {
    let query = this.db
      .from('donations')
      .select(
        `
        *,
        user_profiles!donations_donor_auth_id_fkey(
          id, first_name, last_name, profile_photo_key
        ),
        bh_campaigns!donations_campaign_id_fkey(
          id, title, type, target_amount, current_amount, start_date, end_date, status
        )
      `,
      )
      .order('donated_at', { ascending: false });

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('donations')
      .select(
        `
        *,
        user_profiles!donations_donor_auth_id_fkey(
          id, first_name, last_name, phone, address, barangay, municipality, province,
          profile_photo_key, role
        ),
        bh_campaigns!donations_campaign_id_fkey(
          id, title, description, type, target_amount, current_amount,
          start_date, end_date, org_id, status, cover_image_key
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Donation ${id} not found`);
    return data;
  }

  /** Inventory summary: group donations by campaign with totals */
  async getInventory(campaignId?: string) {
    let query = this.db
      .from('donations')
      .select(
        `
        campaign_id,
        amount,
        currency,
        payment_method,
        donated_at,
        status,
        bh_campaigns!donations_campaign_id_fkey(
          id, title, type, target_amount, current_amount,
          start_date, end_date, status, org_id,
          organizations!bh_campaigns_org_id_fkey(id, name, address)
        )
      `,
      )
      .eq('status', 'completed')
      .order('donated_at', { ascending: false });

    if (campaignId) query = query.eq('campaign_id', campaignId);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    // Aggregate by campaign
    const campaignMap: Record<string, any> = {};
    for (const donation of data ?? []) {
      const cid = donation.campaign_id;
      if (!campaignMap[cid]) {
        campaignMap[cid] = {
          campaign: donation.bh_campaigns,
          total_raised: 0,
          donation_count: 0,
          donations: [],
        };
      }
      campaignMap[cid].total_raised += Number(donation.amount);
      campaignMap[cid].donation_count += 1;
      campaignMap[cid].donations.push(donation);
    }

    return Object.values(campaignMap);
  }
}
