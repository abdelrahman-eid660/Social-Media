import { TokenService, tokenService , redisService, RedisService, IGenerateToken} from './../../common/service';
import { IUser } from './../../common/enum/user.enum';
import { UserRepository } from "../../DB/Repository";
import { ConflictException, NotFoundException } from '../../common/exception';
import { LogoutEnum } from '../../common/enum';
import { compareHash, generateHash } from '../../common/utils/security';
import { HydratedDocument } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { ACCESS_EXPIRES_IN } from '../../config/config';

class UserService {
    private readonly UserRepository : UserRepository
    private redis : RedisService
    private tokenService : TokenService
    constructor(){
        this.UserRepository = new UserRepository()
        this.redis = redisService
        this.tokenService = tokenService
    }
    async profile(User : HydratedDocument<IUser>){
        const user = await this.UserRepository.findOne({filter : {_id : User?._id , confirmedAt : {$exists : true}}})
        if (!user) {
            throw new NotFoundException("No account matching")
        }
        return user
    }
    async updatePassword(data : {oldPassword : string , newPassword : string} , user : HydratedDocument<IUser>) : Promise<string>{
        const {oldPassword , newPassword} = data
        if (!await compareHash(oldPassword , user.password)) {
            throw new NotFoundException("Invalid Password")
        }
        user.password = await generateHash(newPassword)
        await user.save()
        return "Update Password successfuly"
    }
    async rotateToken(user : HydratedDocument<IUser> , issure : string , decodedToken: JwtPayload) : Promise<IGenerateToken>{await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)) , String(decodedToken.jti))
        const now = Math.floor(Date.now() / 1000)
        const ttl = (decodedToken.exp as number) - now
        if (now < ((decodedToken.iat as number) + ACCESS_EXPIRES_IN)) {
            throw new ConflictException("Current access session still valid")
        }
        console.log("hhhh");
        
        await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)) , String(decodedToken.jti))
        await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)),ttl)
        return await this.tokenService.createLoginCredentials(user , issure)
    }
    async logout({ flag }: { flag: number },user: HydratedDocument<IUser>,decodedToken: JwtPayload): Promise<number> {
        let status = 200
        const now = Math.floor(Date.now() / 1000)
        const ttl = (decodedToken.exp as number) - now

        switch (flag) {
            case LogoutEnum.ALL:
            user.changeCredentialsTime = new Date()
            await user.save()
            await this.redis.set({key: this.redis.RevokeAllTokenKey(String(user._id)),value: now})
        break
        default:
            user.changeCredentialsTime = new Date()
            await user.save()
            await this.redis.sadd(this.redis.RevokeTokenKey(String(user._id)) , String(decodedToken.jti))
            await this.redis.expire(this.redis.RevokeTokenKey(String(user._id)),ttl)
            status = 201
        break
        }
        return status
    }
}
export const userService = new UserService()