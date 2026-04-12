"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecryption = exports.generateEncryption = void 0;
const node_crypto_1 = require("node:crypto");
const config_1 = require("../../../config/config");
const exception_1 = require("../../exception");
const generateEncryption = async (plainText) => {
    const iv = (0, node_crypto_1.randomBytes)(config_1.IV_LENGTH);
    const cipherIV = (0, node_crypto_1.createCipheriv)("aes-256-cbc", config_1.ENCRYPTION_SECRET_KEY, iv);
    let cipherText = cipherIV.update(plainText, 'utf-8', 'hex');
    cipherText += cipherIV.final('hex');
    return `${iv.toString('hex')}:${cipherText}`;
};
exports.generateEncryption = generateEncryption;
const generateDecryption = async (cipherText) => {
    const [iv, encryptedData] = (cipherText.split(":") || []);
    if (!iv || !encryptedData) {
        throw new exception_1.BadRequestException("Fail to Encrypt");
    }
    const ivLIKEBinary = Buffer.from(iv, 'hex');
    let decipherIV = (0, node_crypto_1.createDecipheriv)('aes-128-cbc', config_1.ENCRYPTION_SECRET_KEY, ivLIKEBinary);
    let plainText = decipherIV.update(encryptedData, 'hex', 'utf-8');
    plainText += decipherIV.final('utf-8');
    return plainText;
};
exports.generateDecryption = generateDecryption;
