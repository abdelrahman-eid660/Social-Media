"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ResendConfirmEmailScehma = exports.ConfirmForgetPasswordScehma = exports.ForgetPasswordSchema = exports.ConfirmEmailScehma = exports.SignUpSchema = exports.LoginScehma = void 0;
const zod_1 = require("zod");
const enum_1 = require("../../common/enum");
const validation_1 = require("../../common/validation");
exports.LoginScehma = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        password: validation_1.generalValidationFields.password,
        FCM: zod_1.z.string().optional()
    })
};
exports.SignUpSchema = {
    body: exports.LoginScehma.body.safeExtend({
        firstName: validation_1.generalValidationFields.firstName,
        lastName: validation_1.generalValidationFields.lastName,
        userName: validation_1.generalValidationFields.userName.optional(),
        confirmPassword: validation_1.generalValidationFields.confirmPassword,
        bio: zod_1.z.string().optional(),
        phone: validation_1.generalValidationFields.phone.optional(),
        profileImage: zod_1.z.string().optional(),
        coverImage: zod_1.z.string().optional(),
        DOB: zod_1.z.coerce.date().optional(),
        provider: zod_1.z.enum(enum_1.ProviderEnum).optional(),
        gender: zod_1.z.enum(enum_1.GenderEnum).optional(),
        role: zod_1.z.enum(enum_1.RoleEnum).optional()
    }).superRefine((data, ctx) => {
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"],
            });
        }
    }),
};
exports.ConfirmEmailScehma = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        otp: validation_1.generalValidationFields.otp,
    })
};
exports.ForgetPasswordSchema = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        phone: validation_1.generalValidationFields.phone.optional()
    })
};
exports.ConfirmForgetPasswordScehma = {
    body: exports.ConfirmEmailScehma.body
};
exports.ResendConfirmEmailScehma = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
    })
};
exports.ResetPasswordSchema = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        password: validation_1.generalValidationFields.password
    })
};
