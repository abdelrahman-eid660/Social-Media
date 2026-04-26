import { model, models, Schema, Types } from "mongoose";
import { IReact, ReactEnum } from "../../common/enum";

const ReactScehma = new Schema<IReact>({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  },
  postId: {
    type: Types.ObjectId,
    ref: "Post",
    required: true
  },
  type: {
    type: Number,
    enum: ReactEnum,
    required: true
  }
},
  {
    strict: true,
    strictQuery: true,
    timestamps: true,
  },
);

export const ReactModel = models.React || model<IReact>("React", ReactScehma);
