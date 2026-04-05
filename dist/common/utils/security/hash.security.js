"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcrypt_1 = require("bcrypt");
const config_1 = require("../../../config/config");
const generateHash = async (plainText, salt = config_1.SALT_ROUND) => {
    return await (0, bcrypt_1.hash)(plainText, salt);
};
exports.generateHash = generateHash;
const compareHash = async (plainText, cipherText) => {
    return await (0, bcrypt_1.compare)(plainText, cipherText);
};
exports.compareHash = compareHash;
