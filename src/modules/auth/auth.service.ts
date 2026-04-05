import { OAuth2Client } from 'google-auth-library';
import { OTPSubjectEnum, OTPTitleEnum, ProviderEnum, RedisActionsEnum, RedisTypeEnum } from '../../common/enum';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '../../common/exception';
import { deleteKey, get, RedisKey, set } from '../../common/service';
import { generateOtpAndSendOtpEmail, isKeyBlocked, isKeyExpired, maxKeyRequest } from '../../common/service/OTP.service';
import { compareHash, createLoginCredentials, generateHash } from '../../common/utils/security';
import { WEB_CLIENT_ID } from '../../config/config';
import { UserRepository } from '../../DB/Repository';
import { UserModel } from './../../DB/models/user.model';
import { ILoginDTO, ISignupDTO } from "./auth.dto";
import { IGenerateToken } from '../../common/global_Interface.interface';
class AuthService {
  private readonly UserRepository : UserRepository
  constructor() {
    this.UserRepository = new UserRepository(UserModel)
  }
  private async verifyGoogleAccount(idToken : string){
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw new BadRequestException( "Fail to verify this account with google");
  }
  return payload;
  };
  async signup(data: ISignupDTO): Promise<string> {
    const { email, password } = data;
    const user = await this.UserRepository.findOne({filter : {email , confirmEmail: null,
      provider: ProviderEnum.SYSTEM}})
    if (user) {
      throw new ConflictException("User Exist")
    }
    await this.UserRepository.create({
      data : [{...data , password : await generateHash(password)}]
    })
    await generateOtpAndSendOtpEmail({email , expiredTime :  2  })
    return "Check from your gmail"
  }
  async resendConfirmEmail({email} : {email : string}) : Promise<string>{
    const user = await this.UserRepository.findOne({filter : {email , confirmedAt: null,provider: ProviderEnum.SYSTEM}})
    if (!user) {
      throw new NotFoundException("Fail to find matching account")
    }
    await isKeyBlocked({email , type : RedisTypeEnum.ConfirmEmail , blockAction : RedisActionsEnum.BlockRequest})
    await isKeyExpired({email , type : RedisTypeEnum.ConfirmEmail })
    await maxKeyRequest({email , type : RedisTypeEnum.ConfirmEmail , blockAction : RedisActionsEnum.BlockRequest , expiredTime : 5})
    await generateOtpAndSendOtpEmail({email , expiredTime : 2 , title : OTPTitleEnum.ConfirmEmail , subject : OTPSubjectEnum.VerifyAccount})
    return "The code has been sent again, please check your email."
  }
  async confirmEmail(data : {otp : string , email : string}) : Promise<string>{
    const {otp , email} = data
    const user = await this.UserRepository.findOne({filter :  {email , confirmedAt: null,provider: ProviderEnum.SYSTEM}})
    if (!user) {
      throw new NotFoundException("Fail to find matching account")
    }
    const hashedOTP : string | null= await get({key : RedisKey({type : OTPTitleEnum.ConfirmEmail , key : email})})
    if (!hashedOTP) {
      throw new BadRequestException("Expired otp");
    }
    if (!await compareHash(otp , hashedOTP)) {
      throw new BadRequestException("Invalid OTP")
    }
    user.confirmedAt = new Date()
    await user.save()
    await deleteKey(RedisKey({ key : email , action : RedisActionsEnum.Request}))
    return "Confirm Email Successfuly"
  }
  async login(data: ILoginDTO , issure : string) : Promise<IGenerateToken> {
    const {email , password} = data
    await isKeyBlocked({email , type  :RedisTypeEnum.Login , action : RedisActionsEnum.BlockLogin})
    await maxKeyRequest({email , type : RedisTypeEnum.Login , expiredTime : 5  , blockAction : RedisActionsEnum.BlockLogin})
    const account = await this.UserRepository.findOne({filter:{email , confirmedAt : {$exists : true}}})
    if (!account) {
      throw new NotFoundException("Fail to find matching account")
    }
    if (!await compareHash(password , account.password)) {
        throw new BadRequestException("Invalid Cerdientails")
    }
    await deleteKey(RedisKey({key : email , type : RedisTypeEnum.Login , action : RedisActionsEnum.Request}))
    return await createLoginCredentials(account , issure)
  }
  async forgetPassword({email , phone} : {email : string  , phone  : string}) : Promise<string>{
    const user = await this.UserRepository.findOne({filter: {
      $or:[
        {email},
        {phone}
      ],
      provider: ProviderEnum.SYSTEM,
      confirmedAt: { $exists: true },
    },})
    if (!user) {
    throw new NotFoundException("This account not found" );
    }
    await isKeyExpired({email : email || phone , type : RedisTypeEnum.ForgetPassword})
    await generateOtpAndSendOtpEmail({email : email ?? phone , expiredTime : 2 , title : OTPTitleEnum.ForgetPassword , subject : OTPSubjectEnum.ForgetPassword})
    return "OTP sent to your email"
  }
  async confirmForgetPassword({ email, otp } : {email : string , otp : string}) : Promise<string>{
  const user = this.UserRepository.findOne({    filter: {
      email,
      confirmedAt: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    },})
  if (!user) {
    throw new NotFoundException( "Fail to find matching account");
  }
  const hashedOTP = await get({key : RedisKey({type : OTPTitleEnum.ForgetPassword ,key : email})})

  if (!hashedOTP) {
    throw new NotFoundException("Expired otp" );
  }
  const checkOtp = await compareHash(otp, hashedOTP)
  if (!checkOtp) {
    throw new ConflictException("Invalid otp");
  }
  await deleteKey(RedisKey({ key : email , type : RedisTypeEnum.ForgetPassword}))
  await set({key : RedisKey({type : RedisTypeEnum.ResetPassword , key : email}) , value : 1 , ttl : 120}) 
  return "OTP verified successfully";
  }
  async resetPassword({email , password} : {email : string , password : string}) : Promise<string>{
  const user = await this.UserRepository.findOne({filter: {
      email,
      confirmedAt: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    }})
  if (!user) {
    throw new NotFoundException("Fail to find matching account");
  }
  const session = await get({ key: RedisKey({type : RedisTypeEnum.ResetPassword ,key : email}) });
  if (!session) {
    throw new UnauthorizedException( "Invalid reset session")
  }
  const newPassword = password
  const checkSamePassword = await compareHash(newPassword , user.password)
  if (checkSamePassword) {
    throw new ConflictException("This password used befor you can't use it")
  }
  user.password = await generateHash(newPassword)
  user.changeCredentialsTime = new Date(Date.now())
  await user.save()
  return "Password changed Successfuly"
  };
  async signupWithGmail({ idToken } : {idToken : string}, issuer : string) {
  const payload = await this.verifyGoogleAccount(idToken);
  const checkUserExist = await this.UserRepository.findOne({filter: { email: payload.email as string }})
  if (checkUserExist) {
    if (checkUserExist?.provider == ProviderEnum.SYSTEM) {
      throw new ConflictException("Account already exist with diffrent provider ");
    }
    const account = await this.loginWithGmail({ idToken }, issuer);
    return { account, status: 200 };
  }

  const user = await this.UserRepository.createOne({
    data: {
      firstName: payload.given_name as string,
      lastName: payload.family_name as string,
      email: payload.email as string,
      provider: ProviderEnum.GOOGLE as number,
      profileImage: payload.picture as string,
      confirmedAt: new Date() as Date,
    },
  })
  return { account: await createLoginCredentials(user, issuer) };
  };
  async loginWithGmail ({ idToken } : {idToken : string}, issuer : string) : Promise<IGenerateToken>{
  const payload = await this.verifyGoogleAccount(idToken);
  const user = await this.UserRepository.findOne({
    filter: { email: payload.email as string, provider: ProviderEnum.GOOGLE }
  })
  if (!user) {
    throw new NotFoundException( "Invalid login credentials or invalid login approach");
  }
  return await createLoginCredentials(user, issuer);
  };
}
export const authService = new AuthService();
