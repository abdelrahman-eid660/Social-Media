"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const middleware_1 = require("../../middleware");
const enum_1 = require("../../common/enum");
const user_auth_1 = require("./user.auth");
const user_service_1 = require("./user.service");
const multer_1 = require("../../common/utils/multer");
const service_1 = require("../../common/service");
const router = (0, express_1.Router)();
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.profile(req.user);
    (0, response_1.successResponse)({ res, data: account });
});
router.post("/send-notification", async (req, res, next) => {
    await service_1.notificationService.sendNotification({ token: req.body.token, data: { title: "Done", body: "Send notification successful" } });
    (0, response_1.successResponse)({ res });
});
router.patch("/profile-Image", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.profileImage(req.user, req.body);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/cover-image", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), (0, multer_1.CloudFileUpload)({ storageApproach: enum_1.StorageApproachEnum.DISK, validation: multer_1.fieldValidation.image, maxSize: 12 }).single("cover-image"), async (req, res, next) => {
    const account = await user_service_1.userService.coverImage(req.user, req.file);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/update-password", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.updatePassword(req.body, req.user);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/freeze-account", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.SensiveAuth), async (req, res, next) => {
    const account = await user_service_1.userService.freezeUser(req.body);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/unfreeze-account", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.SensiveAuth), async (req, res, next) => {
    const account = await user_service_1.userService.unFreezeUser(req.body);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/restore-account", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.SensiveAuth), async (req, res, next) => {
    const account = await user_service_1.userService.restoreUser(req.body);
    (0, response_1.successResponse)({ res, data: account });
});
router.patch("/soft-delete", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.SensiveAuth), async (req, res, next) => {
    const account = await user_service_1.userService.softDelete(req.body);
    (0, response_1.successResponse)({ res, data: account });
});
router.delete("/delete-account", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_auth_1.endPoint.GeneralAuth), async (req, res, next) => {
    const account = await user_service_1.userService.hardDelete(req.user);
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
