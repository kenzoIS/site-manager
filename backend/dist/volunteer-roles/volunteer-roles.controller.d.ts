import { VolunteerRolesService } from './volunteer-roles.service';
export declare class VolunteerRolesController {
    private readonly service;
    constructor(service: VolunteerRolesService);
    findAll(campaignId?: string, status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
