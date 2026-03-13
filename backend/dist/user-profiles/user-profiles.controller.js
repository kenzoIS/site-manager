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
exports.UserProfilesController = void 0;
const common_1 = require("@nestjs/common");
const user_profiles_service_1 = require("./user-profiles.service");
let UserProfilesController = class UserProfilesController {
    constructor(service) {
        this.service = service;
    }
    findAll(role) {
        return this.service.findAll(role);
    }
    getDonors() {
        return this.service.getDonors();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    getProfilePhoto(photoKey) {
        return this.service.getProfilePhoto(photoKey);
    }
};
exports.UserProfilesController = UserProfilesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserProfilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('donors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserProfilesController.prototype, "getDonors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserProfilesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':photoKey/photo'),
    __param(0, (0, common_1.Param)('photoKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserProfilesController.prototype, "getProfilePhoto", null);
exports.UserProfilesController = UserProfilesController = __decorate([
    (0, common_1.Controller)('user-profiles'),
    __metadata("design:paramtypes", [user_profiles_service_1.UserProfilesService])
], UserProfilesController);
//# sourceMappingURL=user-profiles.controller.js.map