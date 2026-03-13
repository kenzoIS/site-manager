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
exports.DonationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let DonationsService = class DonationsService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    get db() {
        return this.supabase.getClient();
    }
    async findAll(campaignId, status) {
        let query = this.db
            .from('donations')
            .select('*')
            .order('donated_at', { ascending: false });
        if (campaignId)
            query = query.eq('campaign_id', campaignId);
        if (status)
            query = query.eq('status', status);
        const { data: donations, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const items = donations ?? [];
        if (items.length === 0)
            return [];
        const authIds = [...new Set(items.map((d) => d.donor_auth_id).filter(Boolean))];
        const campaignIds = [...new Set(items.map((d) => d.campaign_id).filter(Boolean))];
        const [profilesRes, campaignsRes] = await Promise.all([
            authIds.length
                ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, profile_photo_key').in('auth_user_id', authIds)
                : Promise.resolve({ data: [], error: null }),
            campaignIds.length
                ? this.db.from('bh_campaigns').select('id, title, type, target_amount, current_amount, start_date, end_date, status').in('id', campaignIds)
                : Promise.resolve({ data: [], error: null }),
        ]);
        if (profilesRes.error)
            throw new common_1.BadRequestException(profilesRes.error.message);
        if (campaignsRes.error)
            throw new common_1.BadRequestException(campaignsRes.error.message);
        const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.auth_user_id, p]));
        const campaignMap = new Map((campaignsRes.data ?? []).map((c) => [c.id, c]));
        return items.map((d) => ({
            ...d,
            user_profiles: profileMap.get(d.donor_auth_id) ?? null,
            bh_campaigns: campaignMap.get(d.campaign_id) ?? null,
        }));
    }
    async findOne(id) {
        const { data: donation, error } = await this.db
            .from('donations')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !donation)
            throw new common_1.NotFoundException(`Donation ${id} not found`);
        const [profileRes, campaignRes] = await Promise.all([
            donation.donor_auth_id
                ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, address, barangay, municipality, province, profile_photo_key, role').eq('auth_user_id', donation.donor_auth_id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
            donation.campaign_id
                ? this.db.from('bh_campaigns').select('id, title, description, type, target_amount, current_amount, start_date, end_date, org_id, status, cover_image_key').eq('id', donation.campaign_id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
        ]);
        return {
            ...donation,
            user_profiles: profileRes.data ?? null,
            bh_campaigns: campaignRes.data ?? null,
        };
    }
    async getInventory(campaignId) {
        let query = this.db
            .from('donations')
            .select('campaign_id, amount, currency, payment_method, donated_at, status')
            .in('status', ['confirmed', 'completed', 'pending'])
            .order('donated_at', { ascending: false });
        if (campaignId)
            query = query.eq('campaign_id', campaignId);
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const items = data ?? [];
        if (items.length === 0)
            return [];
        const campaignIds = [...new Set(items.map((d) => d.campaign_id).filter(Boolean))];
        const { data: campaigns, error: cErr } = await this.db
            .from('bh_campaigns')
            .select('id, title, type, target_amount, current_amount, start_date, end_date, status, org_id')
            .in('id', campaignIds);
        if (cErr)
            throw new common_1.BadRequestException(cErr.message);
        const orgIds = [...new Set((campaigns ?? []).map((c) => c.org_id).filter(Boolean))];
        let orgMap = new Map();
        if (orgIds.length) {
            const { data: orgs, error: oErr } = await this.db
                .from('organizations')
                .select('id, name, address')
                .in('id', orgIds);
            if (oErr)
                throw new common_1.BadRequestException(oErr.message);
            orgMap = new Map((orgs ?? []).map((o) => [o.id, o]));
        }
        const campaignMap = {};
        for (const c of campaigns ?? []) {
            campaignMap[c.id] = { ...c, organizations: orgMap.get(c.org_id) ?? null };
        }
        const buckets = {};
        for (const donation of items) {
            const cid = donation.campaign_id;
            if (!buckets[cid]) {
                buckets[cid] = {
                    campaign: campaignMap[cid] ?? null,
                    total_raised: 0,
                    donation_count: 0,
                    donations: [],
                };
            }
            buckets[cid].total_raised += Number(donation.amount);
            buckets[cid].donation_count += 1;
            buckets[cid].donations.push(donation);
        }
        return Object.values(buckets);
    }
};
exports.DonationsService = DonationsService;
exports.DonationsService = DonationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DonationsService);
//# sourceMappingURL=donations.service.js.map