"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
const redis_enum_1 = require("./../enum/redis.enum");
const redis_1 = require("redis");
const config_1 = require("../../config/config");
class RedisService {
    clint;
    constructor() {
        this.clint = (0, redis_1.createClient)({
            url: config_1.REDIS_URI,
        });
        this.handleEvents();
    }
    handleEvents() {
        this.clint.on('connect', () => { console.log(`Redis connected Successfuly ❤️🌞`); });
        this.clint.on('error', (error) => { console.log(`Fail to Connect Redis ❌ ${error}`); });
    }
    async connect() {
        await this.clint.connect();
    }
    async set({ key, value, ttl, parse = false, }) {
        const Value = parse ? JSON.stringify(value) : value;
        if (ttl) {
            return await this.clint.set(key, Value, { EX: ttl });
        }
        return await this.clint.set(key, Value);
    }
    async get({ key, parse = false, }) {
        const data = await this.clint.get(key);
        if (!data)
            return null;
        return parse ? JSON.parse(data) : data;
    }
    async deleteKey(key) {
        if (!key)
            return 0;
        return await this.clint.del(key);
    }
    async exists(key) {
        return await this.clint.exists(key);
    }
    async expire(key, ttl) {
        return await this.clint.expire(key, ttl);
    }
    async ttl(key) {
        return await this.clint.ttl(key);
    }
    async incr(key) {
        return await this.clint.incr(key);
    }
    async mGet(keys) {
        if (!keys.length)
            return [];
        return await this.clint.mGet(keys);
    }
    async keys(prefix) {
        return await this.clint.keys(`${prefix}*`);
    }
    async sadd(key, value) {
        return await this.clint.sAdd(key, value);
    }
    async sismember(key, value) {
        const result = await this.clint.sIsMember(key, value);
        return result === 1;
    }
    RevokeTokenKey(userId) {
        return `revoke:${userId}`;
    }
    RevokeAllTokenKey(userId) {
        return `revoke_all:${userId}`;
    }
    baseRedis({ type = redis_enum_1.RedisTypeEnum.CONFIRMEMAIL, key = redis_enum_1.RedisActionsEnum.REQUEST, action, blockAction, }) {
        return blockAction
            ? `${type}::${key}::${blockAction}`
            : action
                ? `${type}::${key}::${action}`
                : `${type}::${key}`;
    }
    baseProfileRedis(key) {
        return `profile::view::${key}`;
    }
    RedisKey(params = {}) {
        return this.baseRedis(params);
    }
    RedisMaxRequestKey(params = {}) {
        return this.baseRedis(params);
    }
    RedisBlockKey(params = {}) {
        return this.baseRedis(params);
    }
    FCM_Key(userId) {
        return `user:FCM:${userId}`;
    }
    async addFCM(userId, FCMToken) {
        return await this.clint.sAdd(this.FCM_Key(userId), FCMToken);
    }
    async removeFCM(userId, FCMToken) {
        return await this.clint.sRem(this.FCM_Key(userId), FCMToken);
    }
    async getFCMs(userId) {
        return await this.clint.sMembers(this.FCM_Key(userId));
    }
    async hasFCMs(userId) {
        return await this.clint.sCard(this.FCM_Key(userId));
    }
    async removeFCMUser(userId) {
        return await this.clint.del(this.FCM_Key(userId));
    }
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
