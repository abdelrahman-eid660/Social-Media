import { connect } from "mongoose";
import { DB_URI } from "../config/config";
import { UserModel } from "./models";

export const connectDB = async () => {
  try {
    await connect(DB_URI as string);
    await UserModel.syncIndexes()
    console.log(`DB Connected successfully 🌞`);
  } catch (error) {
    console.log(`Fail to connect to database ${error} 🤒`);
  }
};
