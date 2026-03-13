import { VolunteerApplicationsService } from './volunteer-applications.service';
import { FilterApplicationsDto, RejectDocumentsDto } from './dto/application.dto';
export declare class VolunteerApplicationsController {
    private readonly service;
    constructor(service: VolunteerApplicationsService);
    findAll(filters: FilterApplicationsDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    rejectDocuments(id: string, dto: RejectDocumentsDto): Promise<{
        success: boolean;
        status: import("./dto/application.dto").ApplicationStatus;
    }>;
    approveDocuments(id: string): Promise<{
        success: boolean;
        status: import("./dto/application.dto").ApplicationStatus;
    }>;
    rejectApplication(id: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
        status: import("./dto/application.dto").ApplicationStatus;
    }>;
    approveApplication(id: string, body: {
        reviewed_by: string;
    }): Promise<{
        success: boolean;
        status: import("./dto/application.dto").ApplicationStatus;
    }>;
}
