import { RedisTypeEnum, RedisActionsEnum } from "./../enum/redis.enum";
import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { Types } from "mongoose";
type RedisKeyParams = {
  type?: string;
  key?: string;
  action?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
  blockAction?:
    | (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum]
    | undefined;
};

type SetParams<T = any> = {
  key: string;
  value: T;
  ttl?: number;
  parse?: boolean;
};

type GetParams = {
  key: string;
  parse?: boolean;
};

export class RedisService {
  private clint: RedisClientType;
  constructor() {
    this.clint = createClient({
      url: REDIS_URI,
    });
    this.handleEvents()
  }
  private handleEvents(){
    this.clint.on('connect',()=>{console.log(`Redis connected Successfuly ❤️🌞`)})
    this.clint.on('error',(error)=>{console.log(`Fail to Connect Redis ❌ ${error}`)})
  }

  async connect(){
    await this.clint.connect()
  }
    //======================== Set ==========================
  async set<T>({
    key,
    value,
    ttl,
    parse = false,
  }: SetParams<T>): Promise<string | null> {
    const Value = parse ? JSON.stringify(value) : (value as any);

    if (ttl) {
      return await this.clint.set(key, Value, { EX: ttl });
    }

    return await this.clint.set(key, Value);
  }

  //======================== Get ==========================
  async get<T = any>({
    key,
    parse = false,
  }: GetParams): Promise<T | string | null> {
    const data = await this.clint.get(key);

    if (!data) return null;

    return parse ? (JSON.parse(data) as T) : data;
  }

  //======================== Delete =======================
  async deleteKey(key: string | string[]): Promise<number> {
    if (!key) return 0;
    return await this.clint.del(key);
  }

  //======================== Exists =======================
  async exists(key: string): Promise<number> {
    return await this.clint.exists(key);
  }

  //======================== Expire =======================
  async expire(key: string, ttl: number): Promise<number> {
    return await this.clint.expire(key, ttl);
  }

  //======================== TTL ==========================
  async ttl(key: string): Promise<number> {
    return await this.clint.ttl(key);
  }

  //======================== Incr =========================
  async incr(key: string): Promise<number> {
    return await this.clint.incr(key);
  }

  //======================== mGet =========================
  async mGet(keys: string[]): Promise<(string | null)[]> {
    if (!keys.length) return [];
    return await this.clint.mGet(keys);
  }

  //======================== Keys =========================
  async keys(prefix: string): Promise<string[]> {
    return await this.clint.keys(`${prefix}*`);
  }
  //======================== SADD =========================
  async sadd(key: string, value: string): Promise<number> {
    return await this.clint.sAdd(key, value);
  }

  //======================== SISMEMBER ====================
  async sismember(key: string, value: string): Promise<boolean> {
    const result = await this.clint.sIsMember(key, value);
    return result === 1;
  }

  //======================== Login out ======================
  RevokeTokenKey(userId: string | Types.ObjectId): string {
    return `revoke:${userId}`;
  }

  RevokeAllTokenKey(userId: string | Types.ObjectId): string {
    return `revoke_all:${userId}`;
  }
//======================== attampet Formate ====================

  baseRedis({
    type = RedisTypeEnum.CONFIRMEMAIL,
    key = RedisActionsEnum.REQUEST, 
    action,
    blockAction,
  }: RedisKeyParams): string {
    return blockAction
      ? `${type}::${key}::${blockAction}`
      : action
        ? `${type}::${key}::${action}`
        : `${type}::${key}`;
  }

  baseProfileRedis(key: string): string {
    return `profile::view::${key}`;
  }

  RedisKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }

  RedisMaxRequestKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }

  RedisBlockKey(params: RedisKeyParams = {}): string {
    return this.baseRedis(params);
  }
  
  //===================== Notification ====================
  FCM_Key(userId : Types.ObjectId | string){
    return  `user:FCM:${userId}`;
  }
  
  async addFCM(userId : Types.ObjectId | string, FCMToken : string) {
    return await this.clint.sAdd(this.FCM_Key(userId), FCMToken);
  }

  async  removeFCM(userId : Types.ObjectId | string, FCMToken : string) {
    return await this.clint.sRem(this.FCM_Key(userId), FCMToken);
  }

  async  getFCMs(userId : Types.ObjectId | string) {
    return await this.clint.sMembers(this.FCM_Key(userId));
  }

  async  hasFCMs(userId : Types.ObjectId | string) {
    return await this.clint.sCard(this.FCM_Key(userId));
  }

  async  removeFCMUser(userId : Types.ObjectId | string) {
    return await this.clint.del(this.FCM_Key(userId));
  }

}

export const redisService = new RedisService()