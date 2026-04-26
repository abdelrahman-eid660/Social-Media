import express from "express";
import cors from "cors";
import { AuthRouter, PostRouter, UserRouter } from "./modules";
import { globalErrorHandelr } from "./middleware/error.middleware";
import { connectDB } from "./DB";
import { redisService, s3Service } from "./common/service";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import {port} from './config/config'
const s3WriteStream = promisify(pipeline);
async function bootstrap() {
  const Port = port || 3000
  const app: express.Express = express();

  //DB
  await connectDB();
  //REDIS
  await redisService.connect();

  // Global Middleware
  app.use(cors(), express.json());

  app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello");
  });

  // App-routing
  app.use("/Echo/auth", AuthRouter);
  app.use("/Echo/user", UserRouter);
  app.use("/Echo/post", PostRouter);
  app.get("/uploads/*path",async (req: express.Request, res: express.Response): Promise<void> => {
      const {download , fileName} = req.query as {download : string , fileName : string}
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { Body, ContentType } = await s3Service.getAsset({ Key });
      res.setHeader("Content-Type",ContentType || "application/octet-stream")
      res.setHeader("Cache-Control", "public, max-age=31536000") // cashing for 1 year
      res.set("Cross-Origin-Resource-Policy" , "cross-origin")
      if (download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
      }
      return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    },
  );
  // app.get("/pre-signed/*path",async (req: express.Request, res: express.Response): Promise<void> => {
  //     const {download , fileName} = req.query as {download : string , fileName : string}
  //     const { path } = req.params as { path: string[] };
  //     const Key = path.join("/");
  //     const url = await s3Service.createPreSignedFetchLink({Key , download , fileName})
  //     successResponse({res , data :url })
  //   },
  // );
  // Invalid route handling
  app.use("/*dummy", ( req: express.Request, res: express.Response,  next: express.NextFunction,) => {
      res.status(404).json({ message: "Not Found" });
    },
  );
  // global error handling
  app.use(globalErrorHandelr);
  app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
  });
}
export default bootstrap;
