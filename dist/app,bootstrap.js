"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const error_middleware_1 = require("./middleware/error.middleware");
const DB_1 = require("./DB");
const service_1 = require("./common/service");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const config_1 = require("./config/config");
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
async function bootstrap() {
    const Port = config_1.port || 3000;
    const app = (0, express_1.default)();
    await (0, DB_1.connectDB)();
    await service_1.redisService.connect();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/", (req, res) => {
        res.send("Hello");
    });
    app.use("/Echo/auth", modules_1.AuthRouter);
    app.use("/Echo/user", modules_1.UserRouter);
    app.use("/Echo/post", modules_1.PostRouter);
    app.get("/uploads/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await service_1.s3Service.getAsset({ Key });
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body, res);
    });
    app.use("/*dummy", (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });
    app.use(error_middleware_1.globalErrorHandelr);
    app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });
}
exports.default = bootstrap;
