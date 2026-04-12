"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.createLoginCredentials = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../../config/config");
const security_enum_1 = require("../../enum/security.enum");
const node_crypto_1 = require("node:crypto");
const exception_1 = require("../../exception");
const service_1 = require("../../service");
const Repository_1 = require("../../../DB/Repository");
const generateToken = async ({ payload = {}, secret = config_1.USER_TOKEN_SECRET_KEY, options = {} } = {}) => {
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const verifyToken = async ({ token, secret = config_1.USER_TOKEN_SECRET_KEY }) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
const getTokenSignature = async (role) => {
    let accessSignature = undefined;
    let refreashSignature = undefined;
    let audience = security_enum_1.RoleEnum.USER;
    switch (role) {
        case security_enum_1.RoleEnum.SUPERVISER:
            accessSignature = config_1.SUPERVISER_TOKEN_SECRET_KEY;
            refreashSignature = config_1.SUPERVISER_REFREASH_TOKEN_SECRET_KEY;
            audience = security_enum_1.RoleEnum.SUPERVISER;
            break;
        case security_enum_1.RoleEnum.ADMIN:
            accessSignature = config_1.ADMIN_TOKEN_SECRET_KEY;
            refreashSignature = config_1.ADMIN_REFREASH_TOKEN_SECRET_KEY;
            audience = security_enum_1.RoleEnum.ADMIN;
            break;
        default:
            accessSignature = config_1.USER_TOKEN_SECRET_KEY;
            refreashSignature = config_1.USER_REFREASH_TOKEN_SECRET_KEY;
            audience = security_enum_1.RoleEnum.USER;
            break;
    }
    return { accessSignature, refreashSignature, audience };
};
const createLoginCredentials = async (user, issuer) => {
    const { accessSignature, refreashSignature, audience } = await getTokenSignature(user.role);
    const jwtId = (0, node_crypto_1.randomUUID)();
    const access_Token = await generateToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: { issuer, expiresIn: config_1.ACCESS_EXPIRES_IN, jwtid: jwtId, audience: [String(security_enum_1.TokenTypeEnum.ACCESS), String(audience)] }
    });
    const refreash_Token = await generateToken({
        payload: { sub: user._id },
        secret: refreashSignature,
        options: { issuer, expiresIn: config_1.REFREASH_EXPIRES_IN, jwtid: jwtId, audience: [String(security_enum_1.TokenTypeEnum.REFREASH), String(audience)] }
    });
    return { access_Token, refreash_Token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ token, tokenType = security_enum_1.TokenTypeEnum.ACCESS }) => {
    const decode = jsonwebtoken_1.default.decode(token);
    if (!decode?.aud?.length) {
        throw new exception_1.BadRequestException("Fail to decoded token aud is required", "");
    }
    const [decodedTokenType, audience] = decode.aud;
    if (String(tokenType) !== decodedTokenType) {
        throw new exception_1.BadRequestException(`Invalid token type token of type ${decodedTokenType} cannot access this api while we expected token of type ${tokenType}`, "");
    }
    const { accessSignature, refreashSignature } = await getTokenSignature(Number(audience));
    const verifiedDate = await verifyToken({ token, secret: tokenType === security_enum_1.TokenTypeEnum.REFREASH ? refreashSignature : accessSignature });
    const user = await new Repository_1.UserRepository().findOne({ filter: { _id: verifiedDate.sub } });
    if (!user) {
        throw new exception_1.UnauthorizedException("Not Register account");
    }
    const isRevoked = await (0, service_1.sismember)((0, service_1.RevokeTokenKey)(String(user._id)), String(decode.jti));
    if (isRevoked) {
        throw new exception_1.UnauthorizedException("Invalid login session");
    }
    const revokeAll = await (0, service_1.get)({ key: (0, service_1.RevokeAllTokenKey)(String(user._id)) });
    if (revokeAll && Number(revokeAll) > Number(decode.iat)) {
        throw new exception_1.UnauthorizedException("Invalid login session");
    }
    return { user, decode };
};
exports.decodedToken = decodedToken;
