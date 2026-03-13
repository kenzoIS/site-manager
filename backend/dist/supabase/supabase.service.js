"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = SupabaseService_1 = class SupabaseService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(SupabaseService_1.name);
    }
    onModuleInit() {
        const url = this.config.get('SUPABASE_URL');
        const serviceKey = this.config.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!url || !serviceKey) {
            this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
                'Update backend/.env with your Supabase credentials before making API calls.');
        }
        this.client = (0, supabase_js_1.createClient)(url ?? '', serviceKey ?? '', {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    getClient() {
        return this.client;
    }
    async getSignedUrl(bucket, path, expiresInSeconds = 3600) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .createSignedUrl(path, expiresInSeconds);
        if (error) {
            this.logger.error(`Failed to create signed URL for ${bucket}/${path}: ${error.message}`);
            return null;
        }
        return data.signedUrl;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map