"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const volunteer_applications_controller_1 = require("./volunteer-applications.controller");
const volunteer_applications_service_1 = require("./volunteer-applications.service");
let VolunteerApplicationsModule = class VolunteerApplicationsModule {
};
exports.VolunteerApplicationsModule = VolunteerApplicationsModule;
exports.VolunteerApplicationsModule = VolunteerApplicationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [volunteer_applications_controller_1.VolunteerApplicationsController],
        providers: [volunteer_applications_service_1.VolunteerApplicationsService],
    })
], VolunteerApplicationsModule);
//# sourceMappingURL=volunteer-applications.module.js.map