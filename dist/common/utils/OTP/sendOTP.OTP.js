"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../../config/config");
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.EMAIL_APP,
        pass: config_1.PASSWORD_APP,
    },
});
const sendOTP = async ({ to, cc, bcc, html, attachments = [], subject, }) => {
    try {
        await transporter.sendMail({
            to,
            cc,
            bcc,
            subject,
            html,
            attachments,
            from: `${config_1.APPLICATION_NAME} 👨‍⚕️🏥 <${config_1.EMAIL_APP}>`,
        });
    }
    catch (error) {
        console.error("Email error:", error);
        throw error;
    }
};
exports.sendOTP = sendOTP;
