import { SupabaseService } from '../supabase/supabase.service';
import { ApplicationStatus, FilterApplicationsDto, RejectDocumentsDto } from './dto/application.dto';
export declare class VolunteerApplicationsService {
    private supabase;
    constructor(supabase: SupabaseService);
    private get db();
    findAll(filters: FilterApplicationsDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    rejectDocuments(id: string, dto: RejectDocumentsDto): Promise<{
        success: boolean;
        status: ApplicationStatus;
    }>;
    approveDocuments(id: string): Promise<{
        success: boolean;
        status: ApplicationStatus;
    }>;
    rejectApplication(id: string, reason: string): Promise<{
        success: boolean;
        status: ApplicationStatus;
    }>;
    approveApplication(id: string, reviewedBy: string): Promise<{
        success: boolean;
        status: ApplicationStatus;
    }>;
}
