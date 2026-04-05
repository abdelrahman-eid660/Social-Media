import { RedisTypeEnum, RedisActionsEnum } from './../enum/redis.enum';
import { redisClient } from "../../DB";
type RedisKeyParams = {
  type?:string
  key?: string
  action?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined
  blockAction?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined
}

type RevokeTokenParams = {
  userId: string | number
  jti: string
}

type SetParams<T = any> = {
  key: string
  value: T
  ttl?: number
  parse?: boolean
}

type GetParams = {
  key: string
  parse?: boolean
}
export const RevokeTokenKey = (userId: string | number): string => {
  return `revoke:${userId}`
}

export const RevokeAllTokenKey = (userId: string | number): string => {
  return `revoke_all:${userId}`
}

const baseRedis = (
  { type = RedisTypeEnum.ConfirmEmail, key = RedisActionsEnum.Request , action , blockAction }: RedisKeyParams ): string => {
   return blockAction ? `${type}::${key}::${blockAction}` :  action ? `${type}::${key}::${action}` :  `${type}::${key}` 
}

export const baseProfileRedis = (key: string): string => {
  return `profile::view::${key}`
}

export const RedisKey = (params: RedisKeyParams = {}): string => {
  return baseRedis(params)
}

export const RedisMaxRequestKey = (params: RedisKeyParams = {}): string => {
  return baseRedis(params)
}

export const RedisBlockKey = (params: RedisKeyParams = {}): string => {
  return baseRedis(params)
}
//======================== Set ==========================
export const set = async <T>({
  key,
  value,
  ttl,
  parse = false,
}: SetParams<T>): Promise<string | null> => {
  const Value = parse ? JSON.stringify(value) : (value as any)

  if (ttl) {
    return await redisClient.set(key, Value, { EX: ttl })
  }

  return await redisClient.set(key, Value)
}

//======================== Get ==========================
export const get = async <T = any>({
  key,
  parse = false,
}: GetParams): Promise<T | string | null> => {
  const data = await redisClient.get(key)

  if (!data) return null

  return parse ? (JSON.parse(data) as T) : data
}

//======================== Delete =======================
export const deleteKey = async (key: string): Promise<number> => {
  if (!key) return 0
  return await redisClient.del(key)
}

//======================== Exists =======================
export const exists = async (key: string): Promise<number> => {
  return await redisClient.exists(key)
}

//======================== Expire =======================
export const expire = async (key: string, ttl: number): Promise<number> => {
  return await redisClient.expire(key, ttl)
}

//======================== TTL ==========================
export const ttl = async (key: string): Promise<number> => {
  return await redisClient.ttl(key)
}

//======================== Incr =========================
export const incr = async (key: string): Promise<number> => {
  return await redisClient.incr(key)
}

//======================== mGet =========================
export const mGet = async (keys: string[]): Promise<(string | null)[]> => {
  if (!keys.length) return []
  return await redisClient.mGet(keys)
}

//======================== Keys =========================
export const keys = async (prefix: string): Promise<string[]> => {
  return await redisClient.keys(`${prefix}*`)
}
//======================== SADD =========================
export const sadd = async (key: string, value: string): Promise<number> => {
  return await redisClient.sAdd(key, value)
}

//======================== SISMEMBER ====================
export const sismember = async (key: string, value: string): Promise<boolean> => {
  const result = await redisClient.sIsMember(key, value)
  return result === 1
}