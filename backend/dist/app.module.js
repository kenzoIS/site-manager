"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_module_1 = require("./supabase/supabase.module");
const user_profiles_module_1 = require("./user-profiles/user-profiles.module");
const volunteer_applications_module_1 = require("./volunteer-applications/volunteer-applications.module");
const donations_module_1 = require("./donations/donations.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const volunteer_roles_module_1 = require("./volunteer-roles/volunteer-roles.module");
const missions_module_1 = require("./missions/missions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            supabase_module_1.SupabaseModule,
            user_profiles_module_1.UserProfilesModule,
            volunteer_applications_module_1.VolunteerApplicationsModule,
            donations_module_1.DonationsModule,
            campaigns_module_1.CampaignsModule,
            volunteer_roles_module_1.VolunteerRolesModule,
            missions_module_1.MissionsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map