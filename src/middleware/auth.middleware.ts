import { NextFunction, Request, Response } from "express";
import { BadRequestException, ForbiddenException } from "../common/exception";
import { decodedToken } from "../common/utils/security";
import { RoleEnum, TokenTypeEnum } from "../common/enum";

export interface AuthRequest extends Request {
  user?: any;
  decode?: any;
}

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.headers?.authorization) {
      throw new BadRequestException("Missing authorization key");
    }
    const { authorization } = req.headers;
    const [flag, credential] = authorization.split(" ") as [string, string];
    const { user, decode } = await decodedToken({
      token: credential as string,
      tokenType,
    });
    ((req.user = user), (req.decode = decode));
    next();
  };
};

export const authorization =  (accessRole: RoleEnum[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenException("User not authenticated");
    }
    if (!accessRole.includes(req.user.role)) {
      throw new ForbiddenException("Not allowed account");
    }
    next();
  };
};
