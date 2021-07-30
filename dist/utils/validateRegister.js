"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'invalid email',
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'username is not long enough',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'cannot include an @',
            },
        ];
    }
    if (options.password.length <= 5) {
        return [
            {
                field: 'password',
                message: 'password must be longer than 5 digits',
            },
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map