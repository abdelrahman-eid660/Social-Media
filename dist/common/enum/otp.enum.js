"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPSubjectEnum = exports.OTPTitleEnum = void 0;
var OTPTitleEnum;
(function (OTPTitleEnum) {
    OTPTitleEnum["CONFIRMEMAIL"] = "Confirm::Email";
    OTPTitleEnum["LOGIN"] = "Login";
    OTPTitleEnum["FORGETPASSWORD"] = "Forget::password";
    OTPTitleEnum["TWOSTEPVERIFICATION"] = "Confirm::code::2::step::verification";
})(OTPTitleEnum || (exports.OTPTitleEnum = OTPTitleEnum = {}));
var OTPSubjectEnum;
(function (OTPSubjectEnum) {
    OTPSubjectEnum["VERIFYACCOUNT"] = "Verify your account";
    OTPSubjectEnum["LOGIN"] = "Login";
    OTPSubjectEnum["FORGETPASSWORD"] = "Forget password";
    OTPSubjectEnum["TWOSTEPVERIFICATION"] = "Confirm code 2 step verification";
})(OTPSubjectEnum || (exports.OTPSubjectEnum = OTPSubjectEnum = {}));
