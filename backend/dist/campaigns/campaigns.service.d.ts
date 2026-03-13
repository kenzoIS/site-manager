import { SupabaseService } from '../supabase/supabase.service';
export declare class CampaignsService {
    private supabase;
    constructor(supabase: SupabaseService);
    private get db();
    findAll(type?: string, status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
