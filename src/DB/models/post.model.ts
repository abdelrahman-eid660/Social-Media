import { model, models, Schema, Types } from "mongoose";
import { availabilityEnum, IPost } from "../../common/enum";

const PostScehma = new Schema<IPost>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: String,
    attachments: {
      image: [String],
      video: [String],
    },
    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    availability : {
      type : Number,
      enum : availabilityEnum,
      default : availabilityEnum.PUBLIC
    },
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

export const PostModel = models.Post || model<IPost>("Post", PostScehma);
