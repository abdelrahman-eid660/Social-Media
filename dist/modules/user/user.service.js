"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const service_1 = require("./../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/utils/security");
const config_1 = require("../../config/config");
class UserService {
    UserRepository;
    redis;
    tokenService;
    constructor() {
        this.UserRepository = new Repository_1.UserRepository();
        this.redis = service_1.redisService;
        this.tokenService = service_1.tokenService;
    }
    async profile(User) {
        const user = await this.UserRepository.findOne({ filter: { _id: User?._id, confirmedAt: { $exists: true } } });
        if (!user) {
            throw new exception_1.NotFoundException("No account matching");
        }
        return user;
    }
    async updatePassword(data, user) {
        const { oldPassword, newPassword } = data;
        if (!await (0, security_1.compareHash)(oldPassword, user.password)) {
            throw new exception_1.NotFoundException("Invalid Password");
        }
        user.password = await (0, security_1.generateHash)(newPassword);
        await user.save();
        return "Update Password successfuly";
    }
    async rotateToken(user, issure, decodedToken) {
        await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)), String(decodedToken.jti));
        const now = Math.floor(Date.now() / 1000);
        const ttl = decodedToken.exp - now;
        if (now < (decodedToken.iat + config_1.ACCESS_EXPIRES_IN)) {
            throw new exception_1.ConflictException("Current access session still valid");
        }
        console.log("hhhh");
        await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)), String(decodedToken.jti));
        await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)), ttl);
        return await this.tokenService.createLoginCredentials(user, issure);
    }
    async logout({ flag }, user, decodedToken) {
        let status = 200;
        const now = Math.floor(Date.now() / 1000);
        const ttl = decodedToken.exp - now;
        switch (flag) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.set({ key: this.redis.RevokeAllTokenKey(String(user._id)), value: now });
                break;
            default:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)), String(decodedToken.jti));
                await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)), ttl);
                status = 201;
                break;
        }
        return status;
    }
}
exports.userService = new UserService();
