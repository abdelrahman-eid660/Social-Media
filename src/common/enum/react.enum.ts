import { Types } from "mongoose";

export enum ReactEnum{
    LIKES,
    LOVE,
    SUPPORT,
    HAHHH,
    WOW,
    SAD,
    ANGRY
}
export interface IReact{
    userId : Types.ObjectId,
    postId : Types.ObjectId,
    type : ReactEnum
}