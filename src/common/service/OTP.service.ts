import { OTPSubjectEnum, OTPTitleEnum, RedisActionsEnum, RedisTypeEnum } from "../enum";
import { BadRequestException, ConflictException } from "../exception";
import { emailEmitter, generateOTP } from "../utils/OTP";
import { generateHash } from "../utils/security";
import {
  deleteKey,
  get,
  incr,
  RedisBlockKey,
  RedisKey,
  RedisMaxRequestKey,
  set,
  ttl,
} from "./redis.service";

// ==================== Types ====================
type GenerateOtpParams = {
  email: string;
  expiredTime?: number;
  title?: string;
  subject?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum];
};

type KeyCheckParams = {
  email: string;
  type?: string | (typeof RedisTypeEnum)[keyof typeof RedisTypeEnum];
  action? :(typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
  blockAction? :(typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
};

type MaxRequestParams = {
  email: string;
  type?: (typeof RedisTypeEnum)[keyof typeof RedisTypeEnum];
  action?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
  blockAction?: (typeof RedisActionsEnum)[keyof typeof RedisActionsEnum] | undefined;
  expiredTime?: number;
};

// ==================== Generate OTP & Send ====================
export const generateOtpAndSendOtpEmail = async ({
  email,
  expiredTime = 1,
  title = OTPTitleEnum.ConfirmEmail,
  subject = OTPSubjectEnum.VerifyAccount,
}: GenerateOtpParams): Promise<void> => {
  const code = generateOTP();
  const hashedCode = await generateHash(code);
const key = RedisKey({ type: title, key: email });

console.log("SET KEY:", key);
  await set({
    key: RedisKey({ type: title, key: email }),
    value: hashedCode,
    ttl: expiredTime * 60,
  });
const ttlValue = await ttl(key);
console.log("TTL:", ttlValue);
  emailEmitter.emit("SEND_OTP", {
    to: email,
    subject,
    code,
    title,
    expiredTime,
  });
};

// ==================== Check if OTP Key Expired ====================
export const isKeyExpired = async ({
  email,
  type = RedisTypeEnum.ConfirmEmail,
}: KeyCheckParams): Promise<void> => {
    const key = RedisKey({ type, key: email });
  const remainingTime = await ttl(RedisKey({ type, key: email  }));
  if (remainingTime > 0) {
    throw new BadRequestException(
      `لا يمكنك اعاده طلب كود حاليا برجاء انتظار ${remainingTime} ثانية حتي تتمكن من الطلب مجددا`,
      "",
    );
  }
};

// ==================== Max OTP Requests ====================
export const maxKeyRequest = async ({
  email,
  type = RedisTypeEnum.ConfirmEmail,
  action = RedisActionsEnum.Request,
  blockAction,
  expiredTime = 5,
}: MaxRequestParams): Promise<void> => {
  const maxRequestKey = RedisMaxRequestKey({ type, key: email , action });
  const blockKey = RedisBlockKey({ type, key: email , blockAction });
  const currentRequest = await get({ key: maxRequestKey });

  if (currentRequest) {
    await incr(maxRequestKey);

    const newRequestCount = Number(await get({ key: maxRequestKey })) || 0;

    if (newRequestCount > 5) {
      await set({ key: blockKey, value: "true", ttl: expiredTime * 60 });
      await deleteKey(maxRequestKey);

      const blockTTL = await ttl(blockKey);

      throw new ConflictException(
        type === RedisTypeEnum.ConfirmEmail
          ? `لا يمكنك طلب كود اخر برجاء انتظار ${blockTTL} ثانية `
          : `تم عمل بان للحسابك يمكنك المحاولة مجددا بعد ${blockTTL}`,
        "",
      );
    }
  } else {
    await set({ key: maxRequestKey, value: 1 });
  }
};

// ==================== Check if Key Blocked ====================
export const isKeyBlocked = async ({
  email,
  type = RedisTypeEnum.ConfirmEmail,
  action = RedisActionsEnum.BlockRequest
}: KeyCheckParams): Promise<void> => {

  const remainingBlock = await ttl(RedisBlockKey({ type , key: email , action }));
  if (remainingBlock > 0) {
    throw new ConflictException(
      `Your account has been blocked, please wait for ${remainingBlock} seconds`,
      "",
    );
  }
};
