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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfilesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let UserProfilesService = class UserProfilesService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    get db() {
        return this.supabase.getClient();
    }
    async findAll(role) {
        let query = this.db
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (role)
            query = query.eq('role', role);
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async getDonors() {
        const { data: donations, error: dErr } = await this.db
            .from('donations')
            .select('donor_auth_id, amount, currency, payment_method, donated_at, status')
            .order('donated_at', { ascending: false });
        if (dErr)
            throw new common_1.BadRequestException(dErr.message);
        const items = donations ?? [];
        if (items.length === 0)
            return [];
        const authIds = [...new Set(items.map((d) => d.donor_auth_id).filter(Boolean))];
        const { data: profiles, error: pErr } = await this.db
            .from('user_profiles')
            .select('id, auth_user_id, first_name, last_name, phone, barangay, municipality, province, profile_photo_key, role, created_at')
            .in('auth_user_id', authIds);
        if (pErr)
            throw new common_1.BadRequestException(pErr.message);
        const profileMap = new Map((profiles ?? []).map((p) => [p.auth_user_id, p]));
        return items.map((d) => ({
            ...d,
            user_profiles: profileMap.get(d.donor_auth_id) ?? null,
        }));
    }
    async findOne(id) {
        const { data, error } = await this.db
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`Profile ${id} not found`);
        return data;
    }
    async getProfilePhoto(photoKey) {
        const url = await this.supabase.getSignedUrl('avatars', photoKey);
        return { signed_url: url };
    }
};
exports.UserProfilesService = UserProfilesService;
exports.UserProfilesService = UserProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UserProfilesService);
//# sourceMappingURL=user-profiles.service.js.map