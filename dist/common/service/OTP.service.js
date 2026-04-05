"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKeyBlocked = exports.maxKeyRequest = exports.isKeyExpired = exports.generateOtpAndSendOtpEmail = void 0;
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const OTP_1 = require("../utils/OTP");
const security_1 = require("../utils/security");
const redis_service_1 = require("./redis.service");
const generateOtpAndSendOtpEmail = async ({ email, expiredTime = 1, title = enum_1.OTPTitleEnum.ConfirmEmail, subject = enum_1.OTPSubjectEnum.VerifyAccount, }) => {
    const code = (0, OTP_1.generateOTP)();
    const hashedCode = await (0, security_1.generateHash)(code);
    const key = (0, redis_service_1.RedisKey)({ type: title, key: email });
    console.log("SET KEY:", key);
    await (0, redis_service_1.set)({
        key: (0, redis_service_1.RedisKey)({ type: title, key: email }),
        value: hashedCode,
        ttl: expiredTime * 60,
    });
    const ttlValue = await (0, redis_service_1.ttl)(key);
    console.log("TTL:", ttlValue);
    OTP_1.emailEmitter.emit("SEND_OTP", {
        to: email,
        subject,
        code,
        title,
        expiredTime,
    });
};
exports.generateOtpAndSendOtpEmail = generateOtpAndSendOtpEmail;
const isKeyExpired = async ({ email, type = enum_1.RedisTypeEnum.ConfirmEmail, }) => {
    const key = (0, redis_service_1.RedisKey)({ type, key: email });
    const remainingTime = await (0, redis_service_1.ttl)((0, redis_service_1.RedisKey)({ type, key: email }));
    if (remainingTime > 0) {
        throw new exception_1.BadRequestException(`لا يمكنك اعاده طلب كود حاليا برجاء انتظار ${remainingTime} ثانية حتي تتمكن من الطلب مجددا`, "");
    }
};
exports.isKeyExpired = isKeyExpired;
const maxKeyRequest = async ({ email, type = enum_1.RedisTypeEnum.ConfirmEmail, action = enum_1.RedisActionsEnum.Request, blockAction, expiredTime = 5, }) => {
    const maxRequestKey = (0, redis_service_1.RedisMaxRequestKey)({ type, key: email, action });
    const blockKey = (0, redis_service_1.RedisBlockKey)({ type, key: email, blockAction });
    const currentRequest = await (0, redis_service_1.get)({ key: maxRequestKey });
    if (currentRequest) {
        await (0, redis_service_1.incr)(maxRequestKey);
        const newRequestCount = Number(await (0, redis_service_1.get)({ key: maxRequestKey })) || 0;
        if (newRequestCount > 5) {
            await (0, redis_service_1.set)({ key: blockKey, value: "true", ttl: expiredTime * 60 });
            await (0, redis_service_1.deleteKey)(maxRequestKey);
            const blockTTL = await (0, redis_service_1.ttl)(blockKey);
            throw new exception_1.ConflictException(type === enum_1.RedisTypeEnum.ConfirmEmail
                ? `لا يمكنك طلب كود اخر برجاء انتظار ${blockTTL} ثانية `
                : `تم عمل بان للحسابك يمكنك المحاولة مجددا بعد ${blockTTL}`, "");
        }
    }
    else {
        await (0, redis_service_1.set)({ key: maxRequestKey, value: 1 });
    }
};
exports.maxKeyRequest = maxKeyRequest;
const isKeyBlocked = async ({ email, type = enum_1.RedisTypeEnum.ConfirmEmail, action = enum_1.RedisActionsEnum.BlockRequest }) => {
    const remainingBlock = await (0, redis_service_1.ttl)((0, redis_service_1.RedisBlockKey)({ type, key: email, action }));
    if (remainingBlock > 0) {
        throw new exception_1.ConflictException(`Your account has been blocked, please wait for ${remainingBlock} seconds`, "");
    }
};
exports.isKeyBlocked = isKeyBlocked;
