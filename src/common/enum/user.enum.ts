import { ObjectId, Types } from "mongoose";
import { RoleEnum } from "./security.enum";

export enum ProviderEnum {
  SYSTEM,
  GOOGLE,
}
export enum GenderEnum {
  MALE,
  FEMALE,
}
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  userName?: string;
  slug?: string;
  email: string;
  password: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  coverImage?: string;
  DOB?: Date;
  confirmedAt: Date;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt?: Date;
  updatedAt?: Date;
  changeCredentialsTime?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  freezedAt?: Date;
  unfreezedAt?: Date;
}
