import { NextFunction, Request, Response, Router } from "express";
import { authentication, authorization } from "../../middleware";
import { CloudFileUpload, fieldValidation } from "../../common/utils/multer";
import { StorageApproachEnum } from "../../common/enum";
import { postService } from "./post.service";
import { successResponse } from "../../common/response";

const router = Router()
router.post("/create-post",authentication(), CloudFileUpload({storageApproach : StorageApproachEnum.DISK , validation : [...fieldValidation.image , ...fieldValidation.video ], maxSize : 30}).array("attachments" , 40) ,async (req : Request, res : Response, next : NextFunction) => {
  const post = await postService.createPost(req.user , req.body);
   successResponse({res , data :  post});
});
router.post("/create-presigned-link",authentication(),async (req : Request, res : Response, next : NextFunction) => {
  const url = await postService.createPresignedLink(req.body);
   successResponse({res , data :  url});
});
export default router