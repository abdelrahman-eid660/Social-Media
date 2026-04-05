"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redicConnection = exports.redisClient = void 0;
const redis_1 = require("redis");
const config_1 = require("../config/config");
exports.redisClient = (0, redis_1.createClient)({
    url: config_1.REDIS_URI
});
const redicConnection = async () => {
    try {
        exports.redisClient.connect();
        console.log(`Redis connected Successful`);
    }
    catch (error) {
        console.log(`Redis connect Fali`, error);
    }
};
exports.redicConnection = redicConnection;
