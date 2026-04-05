"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandelr = void 0;
const globalErrorHandelr = (error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        error: error,
        message: error.message || "Internal Server Error.",
        cause: error.cause,
        stack: error.stack
    });
};
exports.globalErrorHandelr = globalErrorHandelr;
