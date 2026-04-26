import { IPost, IReact } from "../../common/enum";
import { BaseRepository } from "./base.repository";
import {ReactModel} from '../models'
export class ReactRepository extends BaseRepository<IReact>{
    constructor(){
        super(ReactModel)
    }
}