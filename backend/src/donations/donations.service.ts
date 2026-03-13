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
      .select('*')
      .order('donated_at', { ascending: false });
    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (status) query = query.eq('status', status);

    const { data: donations, error } = await query;
    if (error) throw new BadRequestException(error.message);
    const items = donations ?? [];
    if (items.length === 0) return [];

    const authIds = [...new Set(items.map((d) => d.donor_auth_id).filter(Boolean))];
    const campaignIds = [...new Set(items.map((d) => d.campaign_id).filter(Boolean))];

    const [profilesRes, campaignsRes] = await Promise.all([
      authIds.length
        ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, profile_photo_key').in('auth_user_id', authIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      campaignIds.length
        ? this.db.from('bh_campaigns').select('id, title, type, target_amount, current_amount, start_date, end_date, status').in('id', campaignIds)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    if (profilesRes.error) throw new BadRequestException(profilesRes.error.message);
    if (campaignsRes.error) throw new BadRequestException(campaignsRes.error.message);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.auth_user_id, p]));
    const campaignMap = new Map((campaignsRes.data ?? []).map((c) => [c.id, c]));

    return items.map((d) => ({
      ...d,
      user_profiles: profileMap.get(d.donor_auth_id) ?? null,
      bh_campaigns: campaignMap.get(d.campaign_id) ?? null,
    }));
  }

  async findOne(id: string) {
    const { data: donation, error } = await this.db
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !donation) throw new NotFoundException(`Donation ${id} not found`);

    const [profileRes, campaignRes] = await Promise.all([
      donation.donor_auth_id
        ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, address, barangay, municipality, province, profile_photo_key, role').eq('auth_user_id', donation.donor_auth_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      donation.campaign_id
        ? this.db.from('bh_campaigns').select('id, title, description, type, target_amount, current_amount, start_date, end_date, org_id, status, cover_image_key').eq('id', donation.campaign_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    return {
      ...donation,
      user_profiles: profileRes.data ?? null,
      bh_campaigns: campaignRes.data ?? null,
    };
  }

  /** Inventory summary: group donations by campaign with totals */
  async getInventory(campaignId?: string) {
    let query = this.db
      .from('donations')
      .select('campaign_id, amount, currency, payment_method, donated_at, status')
      .in('status', ['confirmed', 'completed', 'pending'])
      .order('donated_at', { ascending: false });
    if (campaignId) query = query.eq('campaign_id', campaignId);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    const items = data ?? [];
    if (items.length === 0) return [];

    // Step 2: get campaigns
    const campaignIds = [...new Set(items.map((d) => d.campaign_id).filter(Boolean))];
    const { data: campaigns, error: cErr } = await this.db
      .from('bh_campaigns')
      .select('id, title, type, target_amount, current_amount, start_date, end_date, status, org_id')
      .in('id', campaignIds);
    if (cErr) throw new BadRequestException(cErr.message);

    // Step 3: get organizations for those campaigns
    const orgIds = [...new Set((campaigns ?? []).map((c) => c.org_id).filter(Boolean))];
    let orgMap = new Map<string, any>();
    if (orgIds.length) {
      const { data: orgs, error: oErr } = await this.db
        .from('organizations')
        .select('id, name, address')
        .in('id', orgIds);
      if (oErr) throw new BadRequestException(oErr.message);
      orgMap = new Map((orgs ?? []).map((o) => [o.id, o]));
    }

    const campaignMap: Record<string, any> = {};
    for (const c of campaigns ?? []) {
      campaignMap[c.id] = { ...c, organizations: orgMap.get(c.org_id) ?? null };
    }

    // Aggregate by campaign
    const buckets: Record<string, any> = {};
    for (const donation of items) {
      const cid = donation.campaign_id;
      if (!buckets[cid]) {
        buckets[cid] = {
          campaign: campaignMap[cid] ?? null,
          total_raised: 0,
          donation_count: 0,
          donations: [],
        };
      }
      buckets[cid].total_raised += Number(donation.amount);
      buckets[cid].donation_count += 1;
      buckets[cid].donations.push(donation);
    }

    return Object.values(buckets);
  }
}
