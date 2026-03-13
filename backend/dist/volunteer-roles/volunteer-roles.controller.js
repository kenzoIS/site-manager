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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerRolesController = void 0;
const common_1 = require("@nestjs/common");
const volunteer_roles_service_1 = require("./volunteer-roles.service");
let VolunteerRolesController = class VolunteerRolesController {
    constructor(service) {
        this.service = service;
    }
    findAll(campaignId, status) {
        return this.service.findAll(campaignId, status);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.VolunteerRolesController = VolunteerRolesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('campaign_id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VolunteerRolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VolunteerRolesController.prototype, "findOne", null);
exports.VolunteerRolesController = VolunteerRolesController = __decorate([
    (0, common_1.Controller)('volunteer-roles'),
    __metadata("design:paramtypes", [volunteer_roles_service_1.VolunteerRolesService])
], VolunteerRolesController);
//# sourceMappingURL=volunteer-roles.controller.js.map