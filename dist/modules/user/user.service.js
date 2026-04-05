"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const token_security_1 = require("./../../common/utils/security/token.security");
const models_1 = require("../../DB/models");
const Repository_1 = require("../../DB/Repository");
const exception_1 = require("../../common/exception");
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/utils/security");
const service_1 = require("../../common/service");
class UserService {
    UserRepository;
    constructor() {
        this.UserRepository = new Repository_1.UserRepository(models_1.UserModel);
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
    async rotateToken(user, issure) {
        return await (0, token_security_1.createLoginCredentials)(user, issure);
    }
    async logout({ flag }, user, decodedToken) {
        let status = 200;
        const now = Math.floor(Date.now() / 1000);
        const ttl = decodedToken.exp - now;
        switch (flag) {
            case enum_1.LogoutEnum.ALL:
                await (0, service_1.set)({ key: (0, service_1.RevokeAllTokenKey)(String(user._id)), value: now });
                break;
            default:
                await (0, service_1.sadd)((0, service_1.RevokeTokenKey)(String(user._id)), String(decodedToken.jti));
                await (0, service_1.expire)((0, service_1.RevokeTokenKey)(String(user._id)), ttl);
                status = 201;
                break;
        }
        return status;
    }
}
exports.userService = new UserService();
