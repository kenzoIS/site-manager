import { SupabaseService } from '../supabase/supabase.service';
export declare class VolunteerRolesService {
    private supabase;
    constructor(supabase: SupabaseService);
    private get db();
    findAll(campaignId?: string, status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
