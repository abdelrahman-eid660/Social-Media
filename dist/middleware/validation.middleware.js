"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const exception_1 = require("../common/exception");
const validation = (scehma) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(scehma)) {
            if (!scehma[key])
                continue;
            const validationResualt = scehma[key].safeParse(req[key]);
            if (!validationResualt.success) {
                const error = validationResualt.error;
                validationErrors.push({ key, issues: error.issues.map(issue => {
                        return { message: issue.message, path: issue.path };
                    }) });
            }
        }
        if (validationErrors.length) {
            throw new exception_1.BadRequestException("Validation Faild", validationErrors);
        }
        next();
    };
};
exports.validation = validation;
