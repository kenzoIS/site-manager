import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly service;
    constructor(service: CampaignsService);
    findAll(type?: string, status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
