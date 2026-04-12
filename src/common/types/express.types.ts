import { HydratedDocument } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../enum';

declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
      decode: JwtPayload;
    }
  }
}
