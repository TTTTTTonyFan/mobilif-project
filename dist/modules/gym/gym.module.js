"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymModule = void 0;
const common_1 = require("@nestjs/common");
const gym_controller_1 = require("./gym.controller");
const gym_service_1 = require("./gym.service");
const prisma_service_1 = require("../../config/prisma.service");
let GymModule = class GymModule {
};
exports.GymModule = GymModule;
exports.GymModule = GymModule = __decorate([
    (0, common_1.Module)({
        controllers: [gym_controller_1.GymController],
        providers: [gym_service_1.GymService, prisma_service_1.PrismaService],
        exports: [gym_service_1.GymService],
    })
], GymModule);
//# sourceMappingURL=gym.module.js.map