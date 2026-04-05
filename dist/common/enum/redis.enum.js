"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisTypeEnum = exports.RedisActionsEnum = void 0;
exports.RedisActionsEnum = {
    Request: "REQUEST",
    BlockRequest: "BLOCK::REQUEST",
    BlockLogin: "BLOCK::LOGIN",
    BlockForgetPassword: "BLOCK::FOGET::PASSWORD",
    BlockTwoStepVerification: "BLOCK::TWO::STEP::VERIFICATION",
};
exports.RedisTypeEnum = {
    ConfirmEmail: "Confirm::Email",
    Login: "LOGIN",
    ForgetPassword: "FORGET::PASSWORD",
    ResetPassword: "RESET::PASSWORD",
    TwoStepVerification: "TWO::STEP::VERIFICATION",
};
