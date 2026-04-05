"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sismember = exports.sadd = exports.keys = exports.mGet = exports.incr = exports.ttl = exports.expire = exports.exists = exports.deleteKey = exports.get = exports.set = exports.RedisBlockKey = exports.RedisMaxRequestKey = exports.RedisKey = exports.baseProfileRedis = exports.RevokeAllTokenKey = exports.RevokeTokenKey = void 0;
const redis_enum_1 = require("./../enum/redis.enum");
const DB_1 = require("../../DB");
const RevokeTokenKey = (userId) => {
    return `revoke:${userId}`;
};
exports.RevokeTokenKey = RevokeTokenKey;
const RevokeAllTokenKey = (userId) => {
    return `revoke_all:${userId}`;
};
exports.RevokeAllTokenKey = RevokeAllTokenKey;
const baseRedis = ({ type = redis_enum_1.RedisTypeEnum.ConfirmEmail, key = redis_enum_1.RedisActionsEnum.Request, action, blockAction }) => {
    return blockAction ? `${type}::${key}::${blockAction}` : action ? `${type}::${key}::${action}` : `${type}::${key}`;
};
const baseProfileRedis = (key) => {
    return `profile::view::${key}`;
};
exports.baseProfileRedis = baseProfileRedis;
const RedisKey = (params = {}) => {
    return baseRedis(params);
};
exports.RedisKey = RedisKey;
const RedisMaxRequestKey = (params = {}) => {
    return baseRedis(params);
};
exports.RedisMaxRequestKey = RedisMaxRequestKey;
const RedisBlockKey = (params = {}) => {
    return baseRedis(params);
};
exports.RedisBlockKey = RedisBlockKey;
const set = async ({ key, value, ttl, parse = false, }) => {
    const Value = parse ? JSON.stringify(value) : value;
    if (ttl) {
        return await DB_1.redisClient.set(key, Value, { EX: ttl });
    }
    return await DB_1.redisClient.set(key, Value);
};
exports.set = set;
const get = async ({ key, parse = false, }) => {
    const data = await DB_1.redisClient.get(key);
    if (!data)
        return null;
    return parse ? JSON.parse(data) : data;
};
exports.get = get;
const deleteKey = async (key) => {
    if (!key)
        return 0;
    return await DB_1.redisClient.del(key);
};
exports.deleteKey = deleteKey;
const exists = async (key) => {
    return await DB_1.redisClient.exists(key);
};
exports.exists = exists;
const expire = async (key, ttl) => {
    return await DB_1.redisClient.expire(key, ttl);
};
exports.expire = expire;
const ttl = async (key) => {
    return await DB_1.redisClient.ttl(key);
};
exports.ttl = ttl;
const incr = async (key) => {
    return await DB_1.redisClient.incr(key);
};
exports.incr = incr;
const mGet = async (keys) => {
    if (!keys.length)
        return [];
    return await DB_1.redisClient.mGet(keys);
};
exports.mGet = mGet;
const keys = async (prefix) => {
    return await DB_1.redisClient.keys(`${prefix}*`);
};
exports.keys = keys;
const sadd = async (key, value) => {
    return await DB_1.redisClient.sAdd(key, value);
};
exports.sadd = sadd;
const sismember = async (key, value) => {
    const result = await DB_1.redisClient.sIsMember(key, value);
    return result === 1;
};
exports.sismember = sismember;
