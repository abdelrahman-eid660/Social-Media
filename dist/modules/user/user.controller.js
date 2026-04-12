"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const middleware_1 = require("../../middleware");
const enum_1 = require("../../common/enum");
const user_auth_1 = require("./user.auth");
const user_service_1 = require("./user.service");
const router = (0, express_1.Router)();
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.profile(req.user);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/update-password", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.updatePassword(req.body, req.user);
    (0, response_1.successResponse)({ res, data: account });
});
router.get("/rotate", (0, middleware_1.authentication)(enum_1.TokenTypeEnum.REFREASH), async (req, res, next) => {
    const account = await user_service_1.userService.rotateToken(req.user, `${req.protocol}://${req.host}`, req.decode);
    (0, response_1.successResponse)({ res, data: account });
});
router.post("/logout", (0, middleware_1.authentication)(), async (req, res, next) => {
    const status = await user_service_1.userService.logout(req.body, req.user, req.decode);
    (0, response_1.successResponse)({ res, status });
});
exports.default = router;
