"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = __importDefault(require("zod"));
exports.generalValidationFields = {
    id: zod_1.default.string().refine(val => mongoose_1.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" }),
    firstName: zod_1.default.string().min(2).max(20),
    lastName: zod_1.default.string().min(2).max(20),
    email: zod_1.default.string().email(),
    password: zod_1.default.string(),
    confirmPassword: zod_1.default.string(),
    userName: zod_1.default.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    otp: zod_1.default.string().regex(/^\d{6}$/),
    phone: zod_1.default.string().regex(/^(02|2|\+20)?01[0-25]\d{8}$/),
    isTwoFactorEnabled: zod_1.default.boolean(),
};
