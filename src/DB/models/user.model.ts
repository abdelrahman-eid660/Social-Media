import { model, models, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, IUser } from "../../common/enum";

const UserScehma = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true , unique : true },
    password: { type: String, required : function():boolean{
      return this.provider !== ProviderEnum.GOOGLE
    } },
    bio: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    coverImage: { type: [String] },
    DOB: Date,
    confirmedAt: Date,
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },
    createdAt: Date,
    updatedAt: Date,
    changeCredentialsTime  : Date
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

UserScehma.virtual("userName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
  });

export const UserModel = models.User || model<IUser>("User", UserScehma);
