import { UserProfilesService } from './user-profiles.service';
export declare class UserProfilesController {
    private readonly service;
    constructor(service: UserProfilesService);
    findAll(role?: string): Promise<any[]>;
    getDonors(): Promise<{
        user_profiles: {
            id: any;
            auth_user_id: any;
            first_name: any;
            last_name: any;
            phone: any;
            barangay: any;
            municipality: any;
            province: any;
            profile_photo_key: any;
            role: any;
            created_at: any;
        };
        donor_auth_id: any;
        amount: any;
        currency: any;
        payment_method: any;
        donated_at: any;
        status: any;
    }[]>;
    findOne(id: string): Promise<any>;
    getProfilePhoto(photoKey: string): Promise<{
        signed_url: string;
    }>;
}
