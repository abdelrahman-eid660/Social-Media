"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const exception_1 = require("../common/exception");
const enum_1 = require("../common/enum");
const index_1 = require("../common/service/index");
const authentication = (tokenType = enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        if (!req.headers?.authorization) {
            throw new exception_1.BadRequestException("Missing authorization key");
        }
        const { authorization } = req.headers;
        const [flag, credential] = authorization.split(" ");
        const { user, decode } = await index_1.tokenService.decodedToken({
            token: credential,
            tokenType,
        });
        ((req.user = user), (req.decode = decode));
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole = []) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new exception_1.ForbiddenException("User not authenticated");
        }
        if (!accessRole.includes(req.user.role)) {
            throw new exception_1.ForbiddenException("Not allowed account");
        }
        next();
    };
};
exports.authorization = authorization;
