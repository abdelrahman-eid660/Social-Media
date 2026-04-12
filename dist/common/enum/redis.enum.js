"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisTypeEnum = exports.RedisActionsEnum = void 0;
var RedisActionsEnum;
(function (RedisActionsEnum) {
    RedisActionsEnum["REQUEST"] = "REQUEST";
    RedisActionsEnum["BLOCKREQUEST"] = "BLOCK::REQUEST";
    RedisActionsEnum["BLOCKLOGIN"] = "BLOCK::LOGIN";
    RedisActionsEnum["BLOCKFORETPASSWORD"] = "BLOCK::FOGET::PASSWORD";
    RedisActionsEnum["BLOCKTWOSTEPVERIFICATION"] = "BLOCK::TWO::STEP::VERIFICATION";
})(RedisActionsEnum || (exports.RedisActionsEnum = RedisActionsEnum = {}));
var RedisTypeEnum;
(function (RedisTypeEnum) {
    RedisTypeEnum["CONFIRMEMAIL"] = "Confirm::Email";
    RedisTypeEnum["LOGIN"] = "LOGIN";
    RedisTypeEnum["FORGETPASSWORD"] = "FORGET::PASSWORD";
    RedisTypeEnum["RESETPASSWORD"] = "RESET::PASSWORD";
    RedisTypeEnum["TWOSTEPVERIFICATION"] = "TWO::STEP::VERIFICATION";
})(RedisTypeEnum || (exports.RedisTypeEnum = RedisTypeEnum = {}));
