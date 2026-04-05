import { Model } from 'mongoose';
import { IUser } from '../../common/enum';
import { BaseRepository } from './base.repository';
export class UserRepository extends BaseRepository<IUser>{
    constructor(model : Model<IUser>){
        super(model)
    }
}