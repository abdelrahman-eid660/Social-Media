import { model, models, Schema, Types } from "mongoose";
import { IPost } from "../../common/enum";

const PostScehma = new Schema<IPost>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: String,
    image: [String],
    video: [String],
    deletedAt: {
      type: Date,
      default: null,
    },

    restoredAt: {
      type: Date,
      default: null,
    },
  },
  {
    strict: true,
    strictQuery: true,
    timestamps: true,
  },
);

export const PostModel = models.Post || model<any>("Post", PostScehma);
