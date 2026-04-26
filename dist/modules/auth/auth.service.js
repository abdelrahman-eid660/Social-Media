"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const google_auth_library_1 = require("google-auth-library");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const index_1 = require("../../common/service/index");
const security_1 = require("../../common/utils/security");
const config_1 = require("../../config/config");
const Repository_1 = require("../../DB/Repository");
class AuthService {
    UserRepository;
    notification;
    redis;
    token;
    constructor() {
        this.UserRepository = new Repository_1.UserRepository();
        this.redis = index_1.redisService;
        this.token = index_1.tokenService;
        this.notification = index_1.notificationService;
    }
    async verifyGoogleAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_1.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new exception_1.BadRequestException("Fail to verify this account with google");
        }
        return payload;
    }
    ;
    async signup(data) {
        const { email } = data;
        const user = await this.UserRepository.findOne({ filter: { email, confirmEmail: null, provider: enum_1.ProviderEnum.SYSTEM } });
        if (user) {
            throw new exception_1.ConflictException("User Exist");
        }
        await this.UserRepository.create({ data });
        await (0, index_1.generateOtpAndSendOtpEmail)({ email, expiredTime: 2 });
        return "Check from your gmail";
    }
    async resendConfirmEmail({ email }) {
        const user = await this.UserRepository.findOne({ filter: { email, confirmedAt: null, provider: enum_1.ProviderEnum.SYSTEM } });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        await (0, index_1.isKeyBlocked)({ email, type: enum_1.RedisTypeEnum.CONFIRMEMAIL, blockAction: enum_1.RedisActionsEnum.BLOCKREQUEST });
        await (0, index_1.isKeyExpired)({ email, type: enum_1.RedisTypeEnum.CONFIRMEMAIL });
        await (0, index_1.maxKeyRequest)({ email, type: enum_1.RedisTypeEnum.CONFIRMEMAIL, blockAction: enum_1.RedisActionsEnum.BLOCKREQUEST, expiredTime: 5 });
        await (0, index_1.generateOtpAndSendOtpEmail)({ email, expiredTime: 2, title: enum_1.OTPTitleEnum.CONFIRMEMAIL, subject: enum_1.OTPSubjectEnum.VERIFYACCOUNT });
        return "The code has been sent again, please check your email.";
    }
    async confirmEmail(data) {
        const { otp, email } = data;
        const user = await this.UserRepository.findOne({ filter: { email, confirmedAt: null, provider: enum_1.ProviderEnum.SYSTEM } });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        const hashedOTP = await this.redis.get({ key: this.redis.RedisKey({ type: enum_1.OTPTitleEnum.CONFIRMEMAIL, key: email }) });
        if (!hashedOTP) {
            throw new exception_1.BadRequestException("Expired otp");
        }
        if (!await (0, security_1.compareHash)(otp, hashedOTP)) {
            throw new exception_1.BadRequestException("Invalid OTP");
        }
        user.confirmedAt = new Date();
        await user.save();
        await this.redis.deleteKey(this.redis.RedisKey({ key: email, action: enum_1.RedisActionsEnum.REQUEST }));
        return "Confirm Email Successfuly";
    }
    async login(data, issure) {
        const { email, password, FCM } = data;
        await (0, index_1.isKeyBlocked)({ email, type: enum_1.RedisTypeEnum.LOGIN, action: enum_1.RedisActionsEnum.BLOCKLOGIN });
        await (0, index_1.maxKeyRequest)({ email, type: enum_1.RedisTypeEnum.LOGIN, expiredTime: 5, blockAction: enum_1.RedisActionsEnum.BLOCKLOGIN });
        const account = await this.UserRepository.findOne({ filter: { email, confirmedAt: { $exists: true } } });
        if (!account) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        if (!await (0, security_1.compareHash)(password, account.password)) {
            throw new exception_1.BadRequestException("Invalid Cerdientails");
        }
        if (FCM) {
            this.redis.FCM_Key(account._id);
            await this.redis.addFCM(account._id, FCM);
            const tokens = await this.redis.getFCMs(account._id);
            if (tokens?.length) {
                await this.notification.sendNotifications({ tokens, data: { body: `New Login At ${new Date().toLocaleString()}`, title: "Login" } });
            }
        }
        await this.redis.deleteKey(this.redis.RedisKey({ key: email, type: enum_1.RedisTypeEnum.LOGIN, action: enum_1.RedisActionsEnum.REQUEST }));
        return await this.token.createLoginCredentials(account, issure);
    }
    async forgetPassword({ email, phone }) {
        const user = await this.UserRepository.findOne({ filter: {
                $or: [
                    { email },
                    { phone }
                ],
                provider: enum_1.ProviderEnum.SYSTEM,
                confirmedAt: { $exists: true },
            }, });
        if (!user) {
            throw new exception_1.NotFoundException("This account not found");
        }
        await (0, index_1.isKeyExpired)({ email: email || phone, type: enum_1.RedisTypeEnum.FORGETPASSWORD });
        await (0, index_1.generateOtpAndSendOtpEmail)({ email: email ?? phone, expiredTime: 2, title: enum_1.OTPTitleEnum.FORGETPASSWORD, subject: enum_1.OTPSubjectEnum.FORGETPASSWORD });
        return "OTP sent to your email";
    }
    async confirmForgetPassword({ email, otp }) {
        const user = this.UserRepository.findOne({ filter: {
                email,
                confirmedAt: { $exists: true },
                provider: enum_1.ProviderEnum.SYSTEM,
            }, });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        const hashedOTP = await this.redis.get({ key: this.redis.RedisKey({ type: enum_1.OTPTitleEnum.FORGETPASSWORD, key: email }) });
        if (!hashedOTP) {
            throw new exception_1.NotFoundException("Expired otp");
        }
        const checkOtp = await (0, security_1.compareHash)(otp, hashedOTP);
        if (!checkOtp) {
            throw new exception_1.ConflictException("Invalid otp");
        }
        await this.redis.deleteKey(this.redis.RedisKey({ key: email, type: enum_1.RedisTypeEnum.FORGETPASSWORD }));
        await this.redis.set({ key: this.redis.RedisKey({ type: enum_1.RedisTypeEnum.RESETPASSWORD, key: email }), value: 1, ttl: 120 });
        return "OTP verified successfully";
    }
    async resetPassword({ email, password }) {
        const user = await this.UserRepository.findOne({ filter: {
                email,
                confirmedAt: { $exists: true },
                provider: enum_1.ProviderEnum.SYSTEM,
            } });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        const session = await this.redis.get({ key: this.redis.RedisKey({ type: enum_1.RedisTypeEnum.RESETPASSWORD, key: email }) });
        if (!session) {
            throw new exception_1.UnauthorizedException("Invalid reset session");
        }
        const newPassword = password;
        const checkSamePassword = await (0, security_1.compareHash)(newPassword, user.password);
        if (checkSamePassword) {
            throw new exception_1.ConflictException("This password used befor you can't use it");
        }
        user.changeCredentialsTime = new Date(Date.now());
        await user.save();
        return "Password changed Successfuly";
    }
    ;
    async signupWithGmail({ idToken }, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        const checkUserExist = await this.UserRepository.findOne({ filter: { email: payload.email } });
        if (checkUserExist) {
            if (checkUserExist?.provider == enum_1.ProviderEnum.SYSTEM) {
                throw new exception_1.ConflictException("Account already exist with diffrent provider ");
            }
            const account = await this.loginWithGmail({ idToken }, issuer);
            return { account, status: 200 };
        }
        const user = await this.UserRepository.createOne({
            data: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                provider: enum_1.ProviderEnum.GOOGLE,
                profileImage: payload.picture,
                confirmedAt: new Date(),
            },
        });
        return { account: await this.token.createLoginCredentials(user, issuer) };
    }
    ;
    async loginWithGmail({ idToken }, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        const user = await this.UserRepository.findOne({
            filter: { email: payload.email, provider: enum_1.ProviderEnum.GOOGLE }
        });
        if (!user) {
            throw new exception_1.NotFoundException("Invalid login credentials or invalid login approach");
        }
        return await this.token.createLoginCredentials(user, issuer);
    }
    ;
}
exports.authService = new AuthService();
