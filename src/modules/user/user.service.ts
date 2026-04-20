import { TokenService, tokenService , redisService, RedisService, IGenerateToken} from './../../common/service';
import { IUser } from './../../common/enum/user.enum';
import { UserRepository } from "../../DB/Repository";
import { BadRequestException, ConflictException, NotFoundException } from '../../common/exception';
import { LogoutEnum } from '../../common/enum';
import { compareHash, generateHash } from '../../common/utils/security';
import { HydratedDocument, ObjectId, QueryFilter, Types } from 'mongoose';
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
    async freezeUser({userId} : {userId : string}):Promise<string>{
        const user = await this.UserRepository.findOne({ filter: { _id : new Types.ObjectId(userId) as any }});
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.freezedAt) {
            throw new ConflictException("User is already frozen");
        }
        const account = await this.UserRepository.updateOne({
        filter: { _id: new Types.ObjectId(userId) },
        update: {  freezedAt: new Date() }
        });
        return "User frozen successfully";
    }
    async unFreezeUser({userId} : {userId : string}):Promise<string>{
        const user = await this.UserRepository.findOne({ 
            filter: { _id: new Types.ObjectId(userId) as any } 
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.unfreezedAt) {
            throw new ConflictException("User is already unfrozen");
        }
        const account = await this.UserRepository.updateOne({filter : {_id :  new Types.ObjectId(userId)} , update :  {unfreezedAt : new Date()} })
         return "User unfrozen successfully";
    }
    async softDelete({userId} : {userId : string}):Promise<string>{
        const user = await this.UserRepository.findOne({ 
            filter: { _id: new Types.ObjectId(userId) as any } 
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.deletedAt) {
            throw new ConflictException("User is already in archive");
        }
        const account = await this.UserRepository.updateOne({filter : {_id :  new Types.ObjectId(userId)} , update : {deletedAt : new Date()}})
        return "User add to archive successfuly"
    }
    async restoreUser({userId} : {userId : string}):Promise<string>{
        const user = await this.UserRepository.findOne({ 
            filter: { _id: new Types.ObjectId(userId) as any } 
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.restoredAt) {
            throw new ConflictException("User is already restored");
        }
        const account = await this.UserRepository.updateOne({filter : {_id :  new Types.ObjectId(userId) , paranoid : false} , update : {restoredAt : new Date()}})
        return "User Restored Successful"
    }
    async hardDelete(user : HydratedDocument<IUser>):Promise<string>{
        await this.UserRepository.deleteOne({filter : {_id : user._id , force : true}})
        return "User Deleted Successful"
    }
}
export const userService = new UserService()