"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const response_1 = require("../../common/response");
const middleware_1 = require("../../middleware");
const validators = __importStar(require("./auth.validation"));
const router = (0, express_1.Router)();
router.post("/signup", (0, middleware_1.validation)(validators.SignUpSchema), async (req, res, next) => {
    const message = await auth_service_1.authService.signup(req.body);
    return (0, response_1.successResponse)({ res, status: 201, data: message });
});
router.patch("/confirm-email", (0, middleware_1.validation)(validators.ConfirmEmailScehma), async (req, res, next) => {
    const message = await auth_service_1.authService.confirmEmail(req.body);
    return (0, response_1.successResponse)({ res, status: 200, data: message });
});
router.patch("/resend-confirm-email", (0, middleware_1.validation)(validators.ResendConfirmEmailScehma), async (req, res, next) => {
    const message = await auth_service_1.authService.resendConfirmEmail(req.body);
    return (0, response_1.successResponse)({ res, status: 200, data: message });
});
router.post("/login", (0, middleware_1.validation)(validators.LoginScehma), async (req, res, next) => {
    const account = await auth_service_1.authService.login(req.body, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, data: account });
});
router.post("/forget-password", (0, middleware_1.validation)(validators.ForgetPasswordSchema), async (req, res, next) => {
    const message = await auth_service_1.authService.forgetPassword(req.body);
    return (0, response_1.successResponse)({ res, data: message });
});
router.patch("/confirm-forget-password", (0, middleware_1.validation)(validators.ConfirmForgetPasswordScehma), async (req, res, next) => {
    const message = await auth_service_1.authService.confirmForgetPassword(req.body);
    return (0, response_1.successResponse)({ res, data: message });
});
router.patch("/reset-password", (0, middleware_1.validation)(validators.ResetPasswordSchema), async (req, res, next) => {
    const message = await auth_service_1.authService.resetPassword(req.body);
    return (0, response_1.successResponse)({ res, data: message });
});
router.post("/signup-with-google", async (req, res, next) => {
    const { account, status = 201 } = await auth_service_1.authService.signupWithGmail(req.body, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, status, data: account });
});
router.post("/login-with-google", async (req, res, next) => {
    const account = await auth_service_1.authService.loginWithGmail(req.body, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, data: account });
});
exports.default = router;
