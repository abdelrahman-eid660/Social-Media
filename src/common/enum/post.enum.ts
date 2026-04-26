import { Types } from "mongoose";

export enum availabilityEnum {
  PUBLIC,
  ONLYFRIENDS,
  PRIVATE,
}

export interface IPost {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content?: string;
  attachments?: {
    image?: string[] | string;
    video?: string[] | string;
  };
  tags?: Types.ObjectId[];
  mentions?: Types.ObjectId[];
  availability: availabilityEnum;
  deletedAt?: Date | null;
  restoredAt?: Date | null;
}
