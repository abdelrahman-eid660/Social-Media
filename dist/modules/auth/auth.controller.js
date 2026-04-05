"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const response_1 = require("../../common/response");
const router = (0, express_1.Router)();
router.post("/signup", async (req, res, next) => {
    const message = await auth_service_1.authService.signup(req.body);
    (0, response_1.successResponse)({ res, status: 201, data: message });
});
router.patch("/confirm-email", async (req, res, next) => {
    const message = await auth_service_1.authService.confirmEmail(req.body);
    (0, response_1.successResponse)({ res, status: 200, data: message });
});
router.patch("/resend-confirm-email", async (req, res, next) => {
    const message = await auth_service_1.authService.resendConfirmEmail(req.body);
    (0, response_1.successResponse)({ res, status: 200, data: message });
});
router.post("/login", async (req, res, next) => {
    const account = await auth_service_1.authService.login(req.body, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({ res, data: account });
});
router.post("/forget-password", async (req, res, next) => {
    const message = await auth_service_1.authService.forgetPassword(req.body);
    (0, response_1.successResponse)({ res, data: message });
});
router.patch("/confirm-forget-password", async (req, res, next) => {
    const message = await auth_service_1.authService.confirmForgetPassword(req.body);
    (0, response_1.successResponse)({ res, data: message });
});
router.patch("/reset-password", async (req, res, next) => {
    const message = await auth_service_1.authService.resetPassword(req.body);
    (0, response_1.successResponse)({ res, data: message });
});
router.post("/signup-with-google", async (req, res, next) => {
    const { account, status = 201 } = await auth_service_1.authService.signupWithGmail(req.body, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({ res, status, data: account });
});
router.post("/login-with-google", async (req, res, next) => {
    const account = await auth_service_1.authService.loginWithGmail(req.body, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({ res, data: account });
});
exports.default = router;
