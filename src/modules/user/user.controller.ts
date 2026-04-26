import { NextFunction, Request, Response, Router } from "express";
import { successResponse } from "../../common/response";
import { authentication, authorization } from "../../middleware";
import { StorageApproachEnum, TokenTypeEnum } from "../../common/enum";
import { endPoint } from "./user.auth";
import { userService } from "./user.service";
import { CloudFileUpload, fieldValidation } from "../../common/utils/multer";
import { notificationService } from "../../common/service";
const router = Router()
router.get("/", authentication() , authorization(endPoint.GeneralAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.profile(req.user);
   successResponse({res, data : account});
});
router.post("/send-notification" ,async (req : Request, res : Response, next : NextFunction) => {
  await notificationService.sendNotification({token : req.body.token , data : {title : "Done" , body : "Send notification successful"}})
   successResponse({res});
});
router.patch("/profile-Image",authentication(), authorization(endPoint.GeneralAuth),async (req : Request, res : Response, next : NextFunction) => {  
  const account = await userService.profileImage(req.user , req.body);
   successResponse({res , data :  account});
});
// router.patch("/profile-Image",authentication(), authorization(endPoint.GeneralAuth), CloudFileUpload({storageApproach : StorageApproachEnum.DISK , validation : fieldValidation.image , maxSize : 7}).single("profile-image") ,async (req : Request, res : Response, next : NextFunction) => {
//   const account = await userService.profileImage(req.user , req.file as Express.Multer.File);
//    successResponse({res , data :  account});
// });
router.patch("/cover-image",authentication(), authorization(endPoint.GeneralAuth), CloudFileUpload({storageApproach : StorageApproachEnum.DISK , validation : fieldValidation.image , maxSize : 12}).single("cover-image") ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.coverImage(req.user , req.file as Express.Multer.File);
   successResponse({res , data :  account});
});
router.patch("/update-password",authentication(), authorization(endPoint.GeneralAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.updatePassword(req.body , req.user);
   successResponse({res , data :  account});
});
router.patch("/freeze-account",authentication(), authorization(endPoint.SensiveAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.freezeUser(req.body);
   successResponse({res , data :  account});
});
router.patch("/unfreeze-account",authentication(), authorization(endPoint.SensiveAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.unFreezeUser(req.body);
   successResponse({res , data :  account});
});
router.patch("/restore-account",authentication(), authorization(endPoint.SensiveAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.restoreUser(req.body);
   successResponse({res , data :  account});
});
router.patch("/soft-delete",authentication(), authorization(endPoint.SensiveAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.softDelete(req.body);
   successResponse({res , data :  account});
});
router.delete("/delete-account",authentication(), authorization(endPoint.GeneralAuth) ,async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.hardDelete(req.user);
   successResponse({res , data :  account});
});
router.get("/rotate",authentication(TokenTypeEnum.REFREASH) , async (req : Request, res : Response, next : NextFunction) => {
  const account = await userService.rotateToken(req.user, `${req.protocol}://${req.host}` , req.decode);
   successResponse({res, data : account});
});
router.post("/logout", authentication(), async (req : Request, res : Response, next : NextFunction) => {
  const status = await userService.logout(req.body , req.user, req.decode);
   successResponse({res, status});
});
export default router