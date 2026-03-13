import { MissionsService, ActivateMissionDto } from './missions.service';
export declare class MissionsController {
    private readonly service;
    constructor(service: MissionsService);
    activate(dto: ActivateMissionDto & {
        activated_by?: string;
    }): Promise<{
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
