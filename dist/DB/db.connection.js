"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const config_1 = require("../config/config");
const models_1 = require("./models");
const connectDB = async () => {
    try {
        await (0, mongoose_1.connect)(config_1.DB_URI);
        await models_1.UserModel.syncIndexes();
        await models_1.PostModel.syncIndexes();
        console.log(`DB Connected successfully 🌞`);
    }
    catch (error) {
        console.log(`Fail to connect to database ${error} 🤒`);
    }
};
exports.connectDB = connectDB;
