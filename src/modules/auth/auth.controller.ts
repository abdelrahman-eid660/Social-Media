import { NextFunction, Request, Response, Router } from "express";
import { authService } from "./auth.service";
import { successResponse } from "../../common/response";
const router = Router();
router.post("/signup",async (req: Request, res: Response, next: NextFunction) => {
    const message = await authService.signup(req.body);
    successResponse<string>({res , status : 201 , data : message})
  },
);
router.patch("/confirm-email",async (req: Request, res: Response, next: NextFunction) => {
    const message = await authService.confirmEmail(req.body);
    successResponse<string>({res , status : 200 , data : message})
  },
);
router.patch("/resend-confirm-email",async (req: Request, res: Response, next: NextFunction) => {
    const message = await authService.resendConfirmEmail(req.body);
    successResponse<string>({res , status : 200 , data : message})
  },
);
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const account = await authService.login(req.body ,  `${req.protocol}://${req.host}`);
  successResponse({res , data : account})
});
router.post("/forget-password", async (req: Request, res: Response, next: NextFunction) => {
  const message = await authService.forgetPassword(req.body);
  successResponse({res , data : message})
});
router.patch("/confirm-forget-password", async (req: Request, res: Response, next: NextFunction) => {
  const message = await authService.confirmForgetPassword(req.body);
  successResponse({res , data : message})
});
router.patch("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  const message = await authService.resetPassword(req.body);
  successResponse({res , data : message})
});
router.post("/signup-with-google", async (req, res, next) => {
  const {account , status = 201} = await authService.signupWithGmail(req.body, `${req.protocol}://${req.host}`);
  successResponse({res, status, data:  account });
});
router.post("/login-with-google", async (req, res, next) => {
  const account  = await authService.loginWithGmail(req.body, `${req.protocol}://${req.host}`);
  successResponse({res, data:  account });
});
export default router;
