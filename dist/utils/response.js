"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomServerResponse = exports.InternalResponse = void 0;
class InternalResponse {
    constructor(status, data, errors) {
        this.status = status;
        this.data = data;
        this.errors = errors;
    }
}
exports.InternalResponse = InternalResponse;
class CustomServerResponse {
    constructor(status, message, data) {
        this.status = status;
        this.data = data;
        this.message = message;
    }
}
exports.CustomServerResponse = CustomServerResponse;
//# sourceMappingURL=response.js.map