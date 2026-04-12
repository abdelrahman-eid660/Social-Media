"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const redis_service_1 = require("./redis.service");
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const Repository_1 = require("../../DB/Repository");
const config_1 = require("../../config/config");
class TokenService {
    redis;
    constructor() {
        this.redis = redis_service_1.redisService;
    }
    async sign({ payload = {}, secret = config_1.USER_TOKEN_SECRET_KEY, options = {} } = {}) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verify({ token, secret = config_1.USER_TOKEN_SECRET_KEY }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignature(role) {
        let accessSignature = undefined;
        let refreashSignature = undefined;
        let audience = enum_1.RoleEnum.USER;
        switch (role) {
            case enum_1.RoleEnum.SUPERVISER:
                accessSignature = config_1.SUPERVISER_TOKEN_SECRET_KEY;
                refreashSignature = config_1.SUPERVISER_REFREASH_TOKEN_SECRET_KEY;
                audience = enum_1.RoleEnum.SUPERVISER;
                break;
            case enum_1.RoleEnum.ADMIN:
                accessSignature = config_1.ADMIN_TOKEN_SECRET_KEY;
                refreashSignature = config_1.ADMIN_REFREASH_TOKEN_SECRET_KEY;
                audience = enum_1.RoleEnum.ADMIN;
                break;
            default:
                accessSignature = config_1.USER_TOKEN_SECRET_KEY;
                refreashSignature = config_1.USER_REFREASH_TOKEN_SECRET_KEY;
                audience = enum_1.RoleEnum.USER;
                break;
        }
        return { accessSignature, refreashSignature, audience };
    }
    async createLoginCredentials(user, issuer) {
        const { accessSignature, refreashSignature, audience } = await this.getTokenSignature(user.role);
        const jwtId = (0, node_crypto_1.randomUUID)();
        const access_Token = await this.sign({
            payload: { sub: user._id },
            secret: accessSignature,
            options: { issuer, expiresIn: config_1.ACCESS_EXPIRES_IN, jwtid: jwtId, audience: [String(enum_1.TokenTypeEnum.ACCESS), String(audience)] }
        });
        const refreash_Token = await this.sign({
            payload: { sub: user._id },
            secret: refreashSignature,
            options: { issuer, expiresIn: config_1.REFREASH_EXPIRES_IN, jwtid: jwtId, audience: [String(enum_1.TokenTypeEnum.REFREASH), String(audience)] }
        });
        return { access_Token, refreash_Token };
    }
    async decodedToken({ token, tokenType = enum_1.TokenTypeEnum.ACCESS }) {
        const decode = jsonwebtoken_1.default.decode(token);
        if (!decode?.aud?.length) {
            throw new exception_1.BadRequestException("Fail to decoded token aud is required");
        }
        const [decodedTokenType, audience] = decode.aud || [];
        if (String(tokenType) !== decodedTokenType) {
            throw new exception_1.BadRequestException(`Invalid token type token of type ${decodedTokenType} cannot access this api while we expected token of type ${tokenType}`);
        }
        const { accessSignature, refreashSignature } = await this.getTokenSignature(Number(audience));
        const verifiedDate = await this.verify({ token, secret: tokenType === enum_1.TokenTypeEnum.REFREASH ? refreashSignature : accessSignature });
        const user = await new Repository_1.UserRepository().findOne({ filter: { _id: verifiedDate.sub } });
        if (!user) {
            throw new exception_1.UnauthorizedException("Not Register account");
        }
        const isRevoked = await this.redis.sismember(this.redis.RevokeTokenKey(String(user._id)), String(decode.jti));
        if (isRevoked) {
            throw new exception_1.UnauthorizedException("Invalid login session");
        }
        const revokeAll = await this.redis.get({ key: this.redis.RevokeAllTokenKey(String(user._id)) });
        if (revokeAll && Number(revokeAll) > Number(decode.iat)) {
            throw new exception_1.UnauthorizedException("Invalid login session");
        }
        return { user, decode };
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
