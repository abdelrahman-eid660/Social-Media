"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, message = "Success", data, status = 200 }) => {
    return res.status(status).json({ message, data });
};
exports.successResponse = successResponse;
