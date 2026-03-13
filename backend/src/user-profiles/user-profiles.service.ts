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
    const { data, error } = await this.db
      .from('donations')
      .select(
        `
        donor_auth_id,
        user_profiles!donations_donor_auth_id_fkey(
          id, first_name, last_name, phone, barangay, municipality, province,
          profile_photo_key, role, created_at
        ),
        amount, currency, payment_method, donated_at, status
      `,
      )
      .order('donated_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
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
