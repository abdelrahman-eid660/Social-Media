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
async function bootstrap() {
    const app = (0, express_1.default)();
    await (0, DB_1.connectDB)();
    await (0, DB_1.redicConnection)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/", (req, res) => {
        res.send("Hello");
    });
    app.use("/Echo/auth", modules_1.AuthRouter);
    app.use("/Echo/profile", modules_1.UserRouter);
    app.use('/*dummy', (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });
    app.use(error_middleware_1.globalErrorHandelr);
    app.listen(3001, () => {
        console.log("Server is running on port 3001");
    });
}
exports.default = bootstrap;
