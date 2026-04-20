"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const service_1 = require("./../../common/service");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/utils/security");
const mongoose_1 = require("mongoose");
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
    async freezeUser({ userId }) {
        const user = await this.UserRepository.findOne({ filter: { _id: new mongoose_1.Types.ObjectId(userId) } });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.freezedAt) {
            throw new exception_1.ConflictException("User is already frozen");
        }
        const account = await this.UserRepository.updateOne({
            filter: { _id: new mongoose_1.Types.ObjectId(userId) },
            update: { freezedAt: new Date() }
        });
        return "User frozen successfully";
    }
    async unFreezeUser({ userId }) {
        const user = await this.UserRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(userId) }
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.unfreezedAt) {
            throw new exception_1.ConflictException("User is already unfrozen");
        }
        const account = await this.UserRepository.updateOne({ filter: { _id: new mongoose_1.Types.ObjectId(userId) }, update: { unfreezedAt: new Date() } });
        return "User unfrozen successfully";
    }
    async softDelete({ userId }) {
        const user = await this.UserRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(userId) }
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.deletedAt) {
            throw new exception_1.ConflictException("User is already in archive");
        }
        const account = await this.UserRepository.updateOne({ filter: { _id: new mongoose_1.Types.ObjectId(userId) }, update: { deletedAt: new Date() } });
        return "User add to archive successfuly";
    }
    async restoreUser({ userId }) {
        const user = await this.UserRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(userId) }
        });
        if (!user) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user.restoredAt) {
            throw new exception_1.ConflictException("User is already restored");
        }
        const account = await this.UserRepository.updateOne({ filter: { _id: new mongoose_1.Types.ObjectId(userId), paranoid: false }, update: { restoredAt: new Date() } });
        return "User Restored Successful";
    }
    async hardDelete(user) {
        await this.UserRepository.deleteOne({ filter: { _id: user._id, force: true } });
        return "User Deleted Successful";
    }
}
exports.userService = new UserService();
