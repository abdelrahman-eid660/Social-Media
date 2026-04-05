import { ObjectId } from "mongoose";
import { RoleEnum } from "./security.enum";

export enum ProviderEnum{
    SYSTEM,
    GOOGLE
}
export enum GenderEnum{
    MALE,
    FEMALE
}
export interface IUser {
  _id : ObjectId;
  firstName: string;
  lastName: string;
  userName? : string;
  email: string;
  password: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string[];
  DOB?: Date;
  confirmedAt: Date;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt: Date;
  updatedAt: Date;
  changeCredentialsTime : Date
}