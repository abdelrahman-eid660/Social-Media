"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.ConflictException = exports.BadRequestException = exports.NotFoundException = void 0;
const application_exception_1 = require("./application.exception");
class NotFoundException extends application_exception_1.ApplicationException {
    constructor(message = "Not Found", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends application_exception_1.ApplicationException {
    constructor(message = "Bad Request", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends application_exception_1.ApplicationException {
    constructor(message = "Conflict Data", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class UnauthorizedException extends application_exception_1.ApplicationException {
    constructor(message = "Unauthorized Data", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends application_exception_1.ApplicationException {
    constructor(message = "Forbidden Data", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
