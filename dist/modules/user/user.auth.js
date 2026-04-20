"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const enum_1 = require("../../common/enum");
exports.endPoint = {
    GeneralAuth: [enum_1.RoleEnum.SUPERVISER, enum_1.RoleEnum.ADMIN, enum_1.RoleEnum.USER],
    SensiveAuth: [enum_1.RoleEnum.SUPERVISER, enum_1.RoleEnum.ADMIN]
};
