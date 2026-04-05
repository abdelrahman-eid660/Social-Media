import { IUser } from './../../common/enum/user.enum';
import { createLoginCredentials, decodedToken } from './../../common/utils/security/token.security';
import { UserModel } from "../../DB/models";
import { UserRepository } from "../../DB/Repository";
import { NotFoundException } from '../../common/exception';
import { LogoutEnum } from '../../common/enum';
import { compareHash, generateHash } from '../../common/utils/security';
import { HydratedDocument } from 'mongoose';
import { IGenerateToken } from '../../common/global_Interface.interface';
import { expire, RevokeAllTokenKey, RevokeTokenKey, sadd, set } from '../../common/service';
import { JwtPayload } from 'jsonwebtoken';

class UserService {
    private readonly UserRepository : UserRepository
    constructor(){
        this.UserRepository = new UserRepository(UserModel)
    }
    async profile(User : IUser){
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
    async rotateToken(user : HydratedDocument<IUser> , issure : string) : Promise<IGenerateToken>{
        return await createLoginCredentials(user , issure)
    }
    async logout({ flag }: { flag: number },user: HydratedDocument<IUser>,decodedToken: JwtPayload): Promise<number> {
        let status = 200
        const now = Math.floor(Date.now() / 1000)
        const ttl = (decodedToken.exp as number) - now

        switch (flag) {
            case LogoutEnum.ALL:
            await set({key: RevokeAllTokenKey(String(user._id)),value: now})
        break
        default:
            await sadd(RevokeTokenKey(String(user._id)) , String(decodedToken.jti))
            await expire(RevokeTokenKey(String(user._id)),ttl)
            status = 201
        break
        }
        return status
    }
}
export const userService = new UserService()