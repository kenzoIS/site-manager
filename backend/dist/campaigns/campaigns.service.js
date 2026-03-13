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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let CampaignsService = class CampaignsService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    get db() {
        return this.supabase.getClient();
    }
    async findAll(type, status) {
        let query = this.db
            .from('bh_campaigns')
            .select('*')
            .order('created_at', { ascending: false });
        if (type)
            query = query.eq('type', type);
        if (status)
            query = query.eq('status', status);
        const { data: campaigns, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const items = campaigns ?? [];
        if (items.length === 0)
            return [];
        const orgIds = [...new Set(items.map((c) => c.org_id).filter(Boolean))];
        const campaignIds = items.map((c) => c.id);
        const [orgsRes, rolesRes] = await Promise.all([
            orgIds.length
                ? this.db.from('organizations').select('id, name, type, contact_email').in('id', orgIds)
                : Promise.resolve({ data: [], error: null }),
            this.db.from('volunteer_roles').select('id, campaign_id, title, slots_total, slots_filled, status').in('campaign_id', campaignIds),
        ]);
        if (orgsRes.error)
            throw new common_1.BadRequestException(orgsRes.error.message);
        if (rolesRes.error)
            throw new common_1.BadRequestException(rolesRes.error.message);
        const orgMap = new Map((orgsRes.data ?? []).map((o) => [o.id, o]));
        const rolesMap = {};
        for (const r of rolesRes.data ?? []) {
            if (!rolesMap[r.campaign_id])
                rolesMap[r.campaign_id] = [];
            rolesMap[r.campaign_id].push(r);
        }
        return items.map((c) => ({
            ...c,
            organizations: orgMap.get(c.org_id) ?? null,
            volunteer_roles: rolesMap[c.id] ?? [],
        }));
    }
    async findOne(id) {
        const { data: campaign, error } = await this.db
            .from('bh_campaigns')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !campaign)
            throw new common_1.NotFoundException(`Campaign ${id} not found`);
        const [orgRes, rolesRes, donationsRes] = await Promise.all([
            campaign.org_id
                ? this.db.from('organizations').select('id, name, type, contact_email, contact_phone, address, verified').eq('id', campaign.org_id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
            this.db.from('volunteer_roles').select('id, title, description, requirements, slots_total, slots_filled, location, start_date, end_date, status').eq('campaign_id', id),
            this.db.from('donations').select('id, amount, currency, status, donated_at').eq('campaign_id', id),
        ]);
        let coverSignedUrl = null;
        if (campaign.cover_image_key) {
            coverSignedUrl = await this.supabase.getSignedUrl('campaign-covers', campaign.cover_image_key);
        }
        return {
            ...campaign,
            organizations: orgRes.data ?? null,
            volunteer_roles: rolesRes.data ?? [],
            donations: donationsRes.data ?? [],
            cover_signed_url: coverSignedUrl,
        };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map