import { JwtPayload } from './../../../../node_modules/@types/jsonwebtoken/index.d';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { ACCESS_EXPIRES_IN, ADMIN_REFREASH_TOKEN_SECRET_KEY, ADMIN_TOKEN_SECRET_KEY, REFREASH_EXPIRES_IN, SUPERVISER_REFREASH_TOKEN_SECRET_KEY, SUPERVISER_TOKEN_SECRET_KEY, USER_REFREASH_TOKEN_SECRET_KEY, USER_TOKEN_SECRET_KEY } from '../../../config/config'
import { RoleEnum, TokenTypeEnum } from '../../enum/security.enum';
import { randomUUID } from 'node:crypto';
import { BadRequestException, UnauthorizedException } from '../../exception';
import { get, RevokeAllTokenKey, RevokeTokenKey, sismember } from '../../service';
import { UserRepository } from '../../../DB/Repository';
import { UserModel } from '../../../DB/models';
import { ObjectId } from 'mongoose';
type GenerateTokenParams = {
  payload?: string | object | Buffer
  secret?: Secret
  options?: SignOptions
}
type VerifyTokenParams = {
  token: string
  secret?: Secret
}
type TokenSignature = {
  accessSignature: string
  refreashSignature: string
  audience: number
}
const generateToken = async ({payload = {} , secret = USER_TOKEN_SECRET_KEY , options = {}}:GenerateTokenParams={}) : Promise<string>=>{
    return jwt.sign(payload , secret , options)
}

const verifyToken = async ({token , secret = USER_TOKEN_SECRET_KEY } : VerifyTokenParams) : Promise<string | JwtPayload>=>{
    return jwt.verify(token , secret)
}

const getTokenSignature = async (role  : number) : Promise<TokenSignature>=>{
    let accessSignature : string | undefined = undefined
    let refreashSignature : string | undefined = undefined
    let audience : number = RoleEnum.USER
    switch (role) {
        case RoleEnum.SUPERVISER:
            accessSignature = SUPERVISER_TOKEN_SECRET_KEY;
            refreashSignature = SUPERVISER_REFREASH_TOKEN_SECRET_KEY
            audience = RoleEnum.SUPERVISER
            break;
        case RoleEnum.ADMIN:
            accessSignature = ADMIN_TOKEN_SECRET_KEY;
            refreashSignature = ADMIN_REFREASH_TOKEN_SECRET_KEY
            audience = RoleEnum.ADMIN
            break;
        default:
            accessSignature = USER_TOKEN_SECRET_KEY
            refreashSignature = USER_REFREASH_TOKEN_SECRET_KEY
            audience = RoleEnum.USER
            break;
    }
    return {accessSignature , refreashSignature , audience}
}

export const createLoginCredentials = async (user : any , issuer : string ) : Promise<{access_Token : string , refreash_Token : string}>=>{
    const {accessSignature , refreashSignature , audience} : TokenSignature = await getTokenSignature(user.role)
    const jwtId = randomUUID()
    const access_Token = await generateToken({
        payload : {sub : user._id},
        secret : accessSignature,
        options : {issuer , expiresIn : ACCESS_EXPIRES_IN , jwtid  : jwtId , audience : [String(TokenTypeEnum.ACCESS) , String(audience)]}
    })
    const refreash_Token = await generateToken({
        payload : {sub : user._id},
        secret : refreashSignature,
        options : {issuer , expiresIn : REFREASH_EXPIRES_IN , jwtid : jwtId , audience : [String(TokenTypeEnum.REFREASH) , String(audience)]}
    })
    return {access_Token , refreash_Token}
}

export const decodedToken = async({token , tokenType = TokenTypeEnum.ACCESS} : {token : string , tokenType : number}) : Promise<{user : any , decode :any}>=>{
    const decode = jwt.decode(token) as JwtPayload
    if (!decode?.aud?.length) {
        throw new BadRequestException("Fail to decoded token aud is required" , "" )
    }
    const [decodedTokenType , audience] = decode.aud
    if (String(tokenType) !== decodedTokenType) {
        throw new BadRequestException(`Invalid token type token of type ${decodedTokenType} cannot access this api while we expected token of type ${tokenType}` , "")
    }
    const {accessSignature , refreashSignature} = await getTokenSignature(Number(audience))
    const verifiedDate = await verifyToken({token , secret : tokenType === TokenTypeEnum.REFREASH ? refreashSignature : accessSignature})
    const user = await new UserRepository(UserModel).findOne({filter : {_id : verifiedDate.sub as unknown as ObjectId}}) 
    if (!user) {
        throw new UnauthorizedException( "Not Register account");
    }
    const isRevoked = await sismember(RevokeTokenKey(String(user._id)),String(decode.jti))
    if (isRevoked) {
        throw new UnauthorizedException("Invalid login session")
    }
    const revokeAll = await get({key: RevokeAllTokenKey(String(user._id))})
    if (revokeAll && Number(revokeAll) > Number(decode.iat)) {
        throw new UnauthorizedException("Invalid login session")
    }
    return {user , decode} 
}