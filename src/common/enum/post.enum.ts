import { Types } from "mongoose"

export interface IPost{
    _id : Types.ObjectId
    userId : Types.ObjectId
    post : string
    image? : string[] | string
    video? : string[] | string
    deletedAt? : Date | null
    restoredAt? : Date | null
}