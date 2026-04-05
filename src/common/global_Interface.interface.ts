import { IUser } from "./enum";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      decode?: any;
    }
  }
}
export interface IGenerateToken {
    access_Token: string,
    refreash_Token: string,
}