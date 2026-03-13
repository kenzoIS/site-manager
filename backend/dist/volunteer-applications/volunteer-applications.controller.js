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
exports.VolunteerApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const volunteer_applications_service_1 = require("./volunteer-applications.service");
const application_dto_1 = require("./dto/application.dto");
let VolunteerApplicationsController = class VolunteerApplicationsController {
    constructor(service) {
        this.service = service;
    }
    findAll(filters) {
        return this.service.findAll(filters);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    rejectDocuments(id, dto) {
        return this.service.rejectDocuments(id, dto);
    }
    approveDocuments(id) {
        return this.service.approveDocuments(id);
    }
    rejectApplication(id, body) {
        return this.service.rejectApplication(id, body.reason);
    }
    approveApplication(id, body) {
        return this.service.approveApplication(id, body.reviewed_by);
    }
};
exports.VolunteerApplicationsController = VolunteerApplicationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [application_dto_1.FilterApplicationsDto]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/reject-documents'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, application_dto_1.RejectDocumentsDto]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "rejectDocuments", null);
__decorate([
    (0, common_1.Patch)(':id/approve-documents'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "approveDocuments", null);
__decorate([
    (0, common_1.Patch)(':id/reject-application'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Patch)(':id/approve-application'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VolunteerApplicationsController.prototype, "approveApplication", null);
exports.VolunteerApplicationsController = VolunteerApplicationsController = __decorate([
    (0, common_1.Controller)('volunteer-applications'),
    __metadata("design:paramtypes", [volunteer_applications_service_1.VolunteerApplicationsService])
], VolunteerApplicationsController);
//# sourceMappingURL=volunteer-applications.controller.js.map