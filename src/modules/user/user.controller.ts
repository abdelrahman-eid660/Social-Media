import { NextFunction, Request, Response, Router } from "express";
import { successResponse } from "../../common/response";
import { authentication, authorization, AuthRequest } from "../../middleware";
import { TokenTypeEnum } from "../../common/enum";
import { endPoint } from "./user.auth";
import { userService } from "./user.service";
const router = Router()
router.get("/", authentication() , authorization(endPoint.GeneralAuth) ,async (req : AuthRequest, res : Response, next : NextFunction) => {
  const account = await userService.profile(req.user);
   successResponse({res, data : account});
});
router.patch("/update-password",authentication(), authorization(endPoint.GeneralAuth) ,async (req : AuthRequest, res : Response, next : NextFunction) => {
  const account = await userService.updatePassword(req.body , req.user);
   successResponse({res , data :  account});
});
router.get("/rotate",authentication(TokenTypeEnum.REFREASH) , async (req : AuthRequest, res : Response, next : NextFunction) => {
  const account = await userService.rotateToken(req.user, `${req.protocol}://${req.host}`);
   successResponse({res, data : account});
});
router.post("/logout", authentication(), async (req : AuthRequest, res : Response, next : NextFunction) => {
  const status = await userService.logout(req.body , req.user, req.decode);
   successResponse({res, status});
});
export default router