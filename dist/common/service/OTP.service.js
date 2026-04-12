"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKeyBlocked = exports.maxKeyRequest = exports.isKeyExpired = exports.generateOtpAndSendOtpEmail = void 0;
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const OTP_1 = require("../utils/OTP");
const security_1 = require("../utils/security");
const redis_service_1 = require("./redis.service");
const generateOtpAndSendOtpEmail = async ({ email, expiredTime = 1, title = enum_1.OTPTitleEnum.CONFIRMEMAIL, subject = enum_1.OTPSubjectEnum.VERIFYACCOUNT, }) => {
    const code = (0, OTP_1.generateOTP)();
    const hashedCode = await (0, security_1.generateHash)(code);
    await redis_service_1.redisService.set({
        key: redis_service_1.redisService.RedisKey({ type: title, key: email }),
        value: hashedCode,
        ttl: expiredTime * 60,
    });
    OTP_1.emailEmitter.emit("SEND_OTP", {
        to: email,
        subject,
        code,
        title,
        expiredTime,
    });
};
exports.generateOtpAndSendOtpEmail = generateOtpAndSendOtpEmail;
const isKeyExpired = async ({ email, type = enum_1.RedisTypeEnum.CONFIRMEMAIL, }) => {
    const remainingTime = await redis_service_1.redisService.ttl(redis_service_1.redisService.RedisKey({ type, key: email }));
    if (remainingTime > 0) {
        throw new exception_1.BadRequestException(`لا يمكنك اعاده طلب كود حاليا برجاء انتظار ${remainingTime} ثانية حتي تتمكن من الطلب مجددا`, "");
    }
};
exports.isKeyExpired = isKeyExpired;
const maxKeyRequest = async ({ email, type = enum_1.RedisTypeEnum.CONFIRMEMAIL, action = enum_1.RedisActionsEnum.REQUEST, blockAction, expiredTime = 5, }) => {
    const maxRequestKey = redis_service_1.redisService.RedisMaxRequestKey({
        type,
        key: email,
        action,
    });
    const blockKey = redis_service_1.redisService.RedisBlockKey({
        type,
        key: email,
        blockAction,
    });
    const currentRequest = await redis_service_1.redisService.get({ key: maxRequestKey });
    if (currentRequest) {
        await redis_service_1.redisService.incr(maxRequestKey);
        const newRequestCount = Number(await redis_service_1.redisService.get({ key: maxRequestKey })) || 0;
        if (newRequestCount > 5) {
            await redis_service_1.redisService.set({
                key: blockKey,
                value: "true",
                ttl: expiredTime * 60,
            });
            await redis_service_1.redisService.deleteKey(maxRequestKey);
            const blockTTL = await redis_service_1.redisService.ttl(blockKey);
            throw new exception_1.ConflictException(type === enum_1.RedisTypeEnum.CONFIRMEMAIL
                ? `لا يمكنك طلب كود اخر برجاء انتظار ${blockTTL} ثانية `
                : `تم عمل بان للحسابك يمكنك المحاولة مجددا بعد ${blockTTL}`, "");
        }
    }
    else {
        await redis_service_1.redisService.set({ key: maxRequestKey, value: 1 });
    }
};
exports.maxKeyRequest = maxKeyRequest;
const isKeyBlocked = async ({ email, type = enum_1.RedisTypeEnum.CONFIRMEMAIL, action = enum_1.RedisActionsEnum.BLOCKREQUEST, }) => {
    const remainingBlock = await redis_service_1.redisService.ttl(redis_service_1.redisService.RedisBlockKey({ type, key: email, action }));
    if (remainingBlock > 0) {
        throw new exception_1.ConflictException(`Your account has been blocked, please wait for ${remainingBlock} seconds`, "");
    }
};
exports.isKeyBlocked = isKeyBlocked;
