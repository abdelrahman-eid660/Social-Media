"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEmitter = void 0;
const node_events_1 = __importDefault(require("node:events"));
const sendOTP_OTP_1 = require("./sendOTP.OTP");
const template_OTP_1 = require("./template.OTP");
const index_1 = require("../../enum/index");
exports.emailEmitter = new node_events_1.default();
exports.emailEmitter.on("SEND_OTP", async (payload) => {
    const { to, code, subject = index_1.OTPSubjectEnum.VerifyAccount, title = index_1.OTPTitleEnum.confirmEmail, expiredTime = 5 } = payload;
    if (!to || !code) {
        console.error("SEND_OTP event missing required params");
        return;
    }
    try {
        await (0, sendOTP_OTP_1.sendOTP)({
            to,
            subject,
            html: (0, template_OTP_1.verifyOTPTemplate)({ code, title, expiredTime }),
        });
    }
    catch (error) {
        console.error(`Fail to send user email: ${error.message}`);
    }
});
