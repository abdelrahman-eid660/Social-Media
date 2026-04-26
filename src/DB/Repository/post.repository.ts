import { IPost } from "../../common/enum";
import { BaseRepository } from "./base.repository";
import {PostModel} from '../models'
export class PostRepository extends BaseRepository<IPost>{
    constructor(){
        super(PostModel)
    }
}