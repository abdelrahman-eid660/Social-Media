"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const UserScehma = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () {
            return this.provider !== enum_1.ProviderEnum.GOOGLE;
        } },
    bio: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    coverImage: { type: [String] },
    DOB: Date,
    confirmedAt: Date,
    provider: {
        type: Number,
        enum: enum_1.ProviderEnum,
        default: enum_1.ProviderEnum.SYSTEM,
    },
    gender: {
        type: Number,
        enum: enum_1.GenderEnum,
        default: enum_1.GenderEnum.MALE,
    },
    role: {
        type: Number,
        enum: enum_1.RoleEnum,
        default: enum_1.RoleEnum.USER,
    },
    createdAt: Date,
    updatedAt: Date,
    changeCredentialsTime: Date
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
UserScehma.virtual("userName")
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
})
    .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", UserScehma);
