import { DonationsService } from './donations.service';
export declare class DonationsController {
    private readonly service;
    constructor(service: DonationsService);
    findAll(campaignId?: string, status?: string): Promise<any[]>;
    getInventory(campaignId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
