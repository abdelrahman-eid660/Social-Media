"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.TokenTypeEnum = exports.RoleEnum = void 0;
var RoleEnum;
(function (RoleEnum) {
    RoleEnum[RoleEnum["SUPERVISER"] = 0] = "SUPERVISER";
    RoleEnum[RoleEnum["ADMIN"] = 1] = "ADMIN";
    RoleEnum[RoleEnum["USER"] = 2] = "USER";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
;
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    TokenTypeEnum[TokenTypeEnum["REFREASH"] = 1] = "REFREASH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
;
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["ALL"] = 0] = "ALL";
    LogoutEnum[LogoutEnum["ONLY"] = 1] = "ONLY";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
;
