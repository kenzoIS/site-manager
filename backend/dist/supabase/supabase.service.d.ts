import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService implements OnModuleInit {
    private config;
    private readonly logger;
    private client;
    constructor(config: ConfigService);
    onModuleInit(): void;
    getClient(): SupabaseClient;
    getSignedUrl(bucket: string, path: string, expiresInSeconds?: number): Promise<string | null>;
}
