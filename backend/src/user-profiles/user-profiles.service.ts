import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UserProfilesService {
  constructor(private supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** Get all user profiles, optionally filtered by role */
  async findAll(role?: string) {
    let query = this.db
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  /** Get donor list — users who have made at least one donation */
  async getDonors() {
    // Step 1: get all donations
    const { data: donations, error: dErr } = await this.db
      .from('donations')
      .select('donor_auth_id, amount, currency, payment_method, donated_at, status')
      .order('donated_at', { ascending: false });
    if (dErr) throw new BadRequestException(dErr.message);

    const items = donations ?? [];
    if (items.length === 0) return [];

    // Step 2: fetch profiles for each unique donor
    const authIds = [...new Set(items.map((d) => d.donor_auth_id).filter(Boolean))];
    const { data: profiles, error: pErr } = await this.db
      .from('user_profiles')
      .select('id, auth_user_id, first_name, last_name, phone, barangay, municipality, province, profile_photo_key, role, created_at')
      .in('auth_user_id', authIds);
    if (pErr) throw new BadRequestException(pErr.message);

    const profileMap = new Map((profiles ?? []).map((p) => [p.auth_user_id, p]));
    return items.map((d) => ({
      ...d,
      user_profiles: profileMap.get(d.donor_auth_id) ?? null,
    }));
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Profile ${id} not found`);
    return data;
  }

  /** Get signed URL for a user's profile photo */
  async getProfilePhoto(photoKey: string) {
    const url = await this.supabase.getSignedUrl('avatars', photoKey);
    return { signed_url: url };
  }
}
