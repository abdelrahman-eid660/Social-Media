"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const google_auth_library_1 = require("google-auth-library");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const service_1 = require("../../common/service");
const OTP_service_1 = require("../../common/service/OTP.service");
const security_1 = require("../../common/utils/security");
const config_1 = require("../../config/config");
const Repository_1 = require("../../DB/Repository");
const user_model_1 = require("./../../DB/models/user.model");
class AuthService {
    UserRepository;
    constructor() {
        this.UserRepository = new Repository_1.UserRepository(user_model_1.UserModel);
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
        const { email, password } = data;
        const user = await this.UserRepository.findOne({ filter: { email, confirmEmail: null,
                provider: enum_1.ProviderEnum.SYSTEM } });
        if (user) {
            throw new exception_1.ConflictException("User Exist");
        }
        await this.UserRepository.create({
            data: [{ ...data, password: await (0, security_1.generateHash)(password) }]
        });
        await (0, OTP_service_1.generateOtpAndSendOtpEmail)({ email, expiredTime: 2 });
        return "Check from your gmail";
    }
    async resendConfirmEmail({ email }) {
        const user = await this.UserRepository.findOne({ filter: { email, confirmedAt: null, provider: enum_1.ProviderEnum.SYSTEM } });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        await (0, OTP_service_1.isKeyBlocked)({ email, type: enum_1.RedisTypeEnum.ConfirmEmail, blockAction: enum_1.RedisActionsEnum.BlockRequest });
        await (0, OTP_service_1.isKeyExpired)({ email, type: enum_1.RedisTypeEnum.ConfirmEmail });
        await (0, OTP_service_1.maxKeyRequest)({ email, type: enum_1.RedisTypeEnum.ConfirmEmail, blockAction: enum_1.RedisActionsEnum.BlockRequest, expiredTime: 5 });
        await (0, OTP_service_1.generateOtpAndSendOtpEmail)({ email, expiredTime: 2, title: enum_1.OTPTitleEnum.ConfirmEmail, subject: enum_1.OTPSubjectEnum.VerifyAccount });
        return "The code has been sent again, please check your email.";
    }
    async confirmEmail(data) {
        const { otp, email } = data;
        const user = await this.UserRepository.findOne({ filter: { email, confirmedAt: null, provider: enum_1.ProviderEnum.SYSTEM } });
        if (!user) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        const hashedOTP = await (0, service_1.get)({ key: (0, service_1.RedisKey)({ type: enum_1.OTPTitleEnum.ConfirmEmail, key: email }) });
        if (!hashedOTP) {
            throw new exception_1.BadRequestException("Expired otp");
        }
        if (!await (0, security_1.compareHash)(otp, hashedOTP)) {
            throw new exception_1.BadRequestException("Invalid OTP");
        }
        user.confirmedAt = new Date();
        await user.save();
        await (0, service_1.deleteKey)((0, service_1.RedisKey)({ key: email, action: enum_1.RedisActionsEnum.Request }));
        return "Confirm Email Successfuly";
    }
    async login(data, issure) {
        const { email, password } = data;
        await (0, OTP_service_1.isKeyBlocked)({ email, type: enum_1.RedisTypeEnum.Login, action: enum_1.RedisActionsEnum.BlockLogin });
        await (0, OTP_service_1.maxKeyRequest)({ email, type: enum_1.RedisTypeEnum.Login, expiredTime: 5, blockAction: enum_1.RedisActionsEnum.BlockLogin });
        const account = await this.UserRepository.findOne({ filter: { email, confirmedAt: { $exists: true } } });
        if (!account) {
            throw new exception_1.NotFoundException("Fail to find matching account");
        }
        if (!await (0, security_1.compareHash)(password, account.password)) {
            throw new exception_1.BadRequestException("Invalid Cerdientails");
        }
        await (0, service_1.deleteKey)((0, service_1.RedisKey)({ key: email, type: enum_1.RedisTypeEnum.Login, action: enum_1.RedisActionsEnum.Request }));
        return await (0, security_1.createLoginCredentials)(account, issure);
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
        await (0, OTP_service_1.isKeyExpired)({ email: email || phone, type: enum_1.RedisTypeEnum.ForgetPassword });
        await (0, OTP_service_1.generateOtpAndSendOtpEmail)({ email: email ?? phone, expiredTime: 2, title: enum_1.OTPTitleEnum.ForgetPassword, subject: enum_1.OTPSubjectEnum.ForgetPassword });
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
        const hashedOTP = await (0, service_1.get)({ key: (0, service_1.RedisKey)({ type: enum_1.OTPTitleEnum.ForgetPassword, key: email }) });
        if (!hashedOTP) {
            throw new exception_1.NotFoundException("Expired otp");
        }
        const checkOtp = await (0, security_1.compareHash)(otp, hashedOTP);
        if (!checkOtp) {
            throw new exception_1.ConflictException("Invalid otp");
        }
        await (0, service_1.deleteKey)((0, service_1.RedisKey)({ key: email, type: enum_1.RedisTypeEnum.ForgetPassword }));
        await (0, service_1.set)({ key: (0, service_1.RedisKey)({ type: enum_1.RedisTypeEnum.ResetPassword, key: email }), value: 1, ttl: 120 });
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
        const session = await (0, service_1.get)({ key: (0, service_1.RedisKey)({ type: enum_1.RedisTypeEnum.ResetPassword, key: email }) });
        if (!session) {
            throw new exception_1.UnauthorizedException("Invalid reset session");
        }
        const newPassword = password;
        const checkSamePassword = await (0, security_1.compareHash)(newPassword, user.password);
        if (checkSamePassword) {
            throw new exception_1.ConflictException("This password used befor you can't use it");
        }
        user.password = await (0, security_1.generateHash)(newPassword);
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
        return { account: await (0, security_1.createLoginCredentials)(user, issuer) };
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
        return await (0, security_1.createLoginCredentials)(user, issuer);
    }
    ;
}
exports.authService = new AuthService();
