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
exports.VolunteerApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const application_dto_1 = require("./dto/application.dto");
let VolunteerApplicationsService = class VolunteerApplicationsService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    get db() {
        return this.supabase.getClient();
    }
    async findAll(filters) {
        let roleIdFilter = null;
        if (filters.campaign_id) {
            const { data: roles, error: rErr } = await this.db
                .from('volunteer_roles')
                .select('id')
                .eq('campaign_id', filters.campaign_id);
            if (rErr)
                throw new common_1.BadRequestException(rErr.message);
            roleIdFilter = (roles ?? []).map((r) => r.id);
            if (roleIdFilter.length === 0)
                return [];
        }
        let query = this.db
            .from('volunteer_applications')
            .select('*')
            .order('applied_at', { ascending: false });
        if (filters.role_id)
            query = query.eq('role_id', filters.role_id);
        if (filters.status)
            query = query.eq('status', filters.status);
        if (roleIdFilter)
            query = query.in('role_id', roleIdFilter);
        const { data: applications, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const items = applications ?? [];
        if (items.length === 0)
            return [];
        const authIds = [...new Set(items.map((a) => a.volunteer_auth_id).filter(Boolean))];
        const roleIds = [...new Set(items.map((a) => a.role_id).filter(Boolean))];
        const [profilesRes, rolesRes] = await Promise.all([
            authIds.length
                ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, barangay, municipality, province, profile_photo_key, role').in('auth_user_id', authIds)
                : Promise.resolve({ data: [], error: null }),
            roleIds.length
                ? this.db.from('volunteer_roles').select('id, title, description, location, start_date, end_date').in('id', roleIds)
                : Promise.resolve({ data: [], error: null }),
        ]);
        if (profilesRes.error)
            throw new common_1.BadRequestException(profilesRes.error.message);
        if (rolesRes.error)
            throw new common_1.BadRequestException(rolesRes.error.message);
        const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.auth_user_id, p]));
        const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.id, r]));
        let results = items.map((a) => ({
            ...a,
            user_profiles: profileMap.get(a.volunteer_auth_id) ?? null,
            volunteer_roles: roleMap.get(a.role_id) ?? null,
        }));
        if (filters.search) {
            const term = filters.search.toLowerCase();
            results = results.filter((a) => {
                const profile = a.user_profiles;
                if (!profile)
                    return false;
                const name = `${profile.first_name} ${profile.last_name}`.toLowerCase();
                return name.includes(term);
            });
        }
        return results;
    }
    async findOne(id) {
        const { data: app, error } = await this.db
            .from('volunteer_applications')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !app)
            throw new common_1.NotFoundException(`Application ${id} not found`);
        const [profileRes, roleRes] = await Promise.all([
            app.volunteer_auth_id
                ? this.db.from('user_profiles').select('id, auth_user_id, first_name, last_name, phone, address, barangay, municipality, province, profile_photo_key, role, created_at').eq('auth_user_id', app.volunteer_auth_id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
            app.role_id
                ? this.db.from('volunteer_roles').select('id, title, description, requirements, slots_total, slots_filled, location, start_date, end_date, status, campaign_id').eq('id', app.role_id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
        ]);
        const role = roleRes.data;
        let campaign = null;
        if (role?.campaign_id) {
            const { data: c } = await this.db
                .from('bh_campaigns')
                .select('id, title, description, type, target_amount, current_amount, start_date, end_date, org_id, status')
                .eq('id', role.campaign_id)
                .maybeSingle();
            campaign = c;
        }
        let resumeSignedUrl = null;
        if (app.resume_key) {
            resumeSignedUrl = await this.supabase.getSignedUrl('resumes', app.resume_key);
        }
        const profile = profileRes.data;
        let isAlsoDonor = false;
        if (profile?.auth_user_id) {
            const { count } = await this.db
                .from('donations')
                .select('id', { count: 'exact', head: true })
                .eq('donor_auth_id', profile.auth_user_id);
            isAlsoDonor = (count ?? 0) > 0;
        }
        return {
            ...app,
            user_profiles: profileRes.data ?? null,
            volunteer_roles: role ? { ...role, bh_campaigns: campaign } : null,
            bh_campaigns: campaign,
            resume_signed_url: resumeSignedUrl,
            is_also_donor: isAlsoDonor,
        };
    }
    async rejectDocuments(id, dto) {
        const { error } = await this.db
            .from('volunteer_applications')
            .update({ status: application_dto_1.ApplicationStatus.DOCUMENTS_REJECTED })
            .eq('id', id);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true, status: application_dto_1.ApplicationStatus.DOCUMENTS_REJECTED };
    }
    async approveDocuments(id) {
        const app = await this.findOne(id);
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const { error } = await this.db
            .from('volunteer_applications')
            .update({ status: application_dto_1.ApplicationStatus.DOCUMENTS_VALID })
            .eq('id', id);
        if (error)
            throw new common_1.BadRequestException(error.message);
        const profile = app.user_profiles;
        if (profile?.auth_user_id) {
            await this.db
                .from('user_profiles')
                .update({ role: 'verified_volunteer' })
                .eq('auth_user_id', profile.auth_user_id);
        }
        return { success: true, status: application_dto_1.ApplicationStatus.DOCUMENTS_VALID };
    }
    async rejectApplication(id, reason) {
        const { error } = await this.db
            .from('volunteer_applications')
            .update({ status: application_dto_1.ApplicationStatus.REJECTED })
            .eq('id', id);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true, status: application_dto_1.ApplicationStatus.REJECTED };
    }
    async approveApplication(id, reviewedBy) {
        const { error } = await this.db
            .from('volunteer_applications')
            .update({
            status: application_dto_1.ApplicationStatus.APPROVED,
            reviewed_by: reviewedBy,
        })
            .eq('id', id);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true, status: application_dto_1.ApplicationStatus.APPROVED };
    }
};
exports.VolunteerApplicationsService = VolunteerApplicationsService;
exports.VolunteerApplicationsService = VolunteerApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], VolunteerApplicationsService);
//# sourceMappingURL=volunteer-applications.service.js.map