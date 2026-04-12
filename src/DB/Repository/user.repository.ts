import { IUser } from '../../common/enum';
import { BaseRepository } from './base.repository';
import { UserModel } from '../models';
export class UserRepository extends BaseRepository<IUser>{
    constructor(){
        super(UserModel)
    }
}