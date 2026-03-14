import { SupabaseService } from '../supabase/supabase.service';
export interface ActivateMissionDto {
    campaign_id: string;
    role_id: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    notes?: string;
}
export declare class MissionsService {
    private supabase;
    constructor(supabase: SupabaseService);
    private get db();
    activateMission(dto: ActivateMissionDto, activatedBy: string): Promise<{
        success: boolean;
        deployments_created: number;
        message: string;
        deployments?: undefined;
    } | {
        success: boolean;
        deployments_created: number;
        deployments: any[];
        message?: undefined;
    }>;
    getVolunteerSummary(campaignId?: string): Promise<{
        summary: {
            total: number;
            active: number;
            on_mission: number;
            completed: number;
        };
        by_role: Record<string, number>;
        deployments: {
            id: any;
            status: string;
            application_id: any;
            date_assigned: any;
            task_description: any;
            damayan_operation_id: any;
            volunteer_applications: any;
        }[];
    }>;
}
