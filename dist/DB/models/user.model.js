"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const security_1 = require("../../common/utils/security");
const post_model_1 = require("./post.model");
const UserScehma = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () {
            return this.provider !== enum_1.ProviderEnum.GOOGLE;
        } },
    slug: { type: String },
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
    changeCredentialsTime: Date,
    deletedAt: Date,
    restoredAt: Date,
    freezedAt: Date,
    unfreezedAt: Date,
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
UserScehma.pre("validate", function () {
    if (this.provider && this.provider == enum_1.ProviderEnum.GOOGLE) {
        throw new exception_1.BadRequestException("You can't send password with google email");
    }
});
UserScehma.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await (0, security_1.generateHash)(this.password);
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await (0, security_1.generateEncryption)(this.phone);
    }
});
UserScehma.pre(["find", "findOne"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
UserScehma.pre(["updateOne", "findOneAndUpdate"], async function () {
    const update = this.getUpdate();
    const query = this.getQuery();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
        await post_model_1.PostModel.updateMany({ userId: query._id }, { $set: { deletedAt: new Date(Date.now()) } });
    }
    if (update.restoredAt) {
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        await post_model_1.PostModel.updateMany({ userId: query._id }, { $set: { restoredAt: new Date(Date.now()) } });
    }
    if (update.freezedAt) {
        this.setUpdate({ ...update, $unset: { unfreezedAt: 1 } });
    }
    if (update.unfreezedAt) {
        this.setQuery({ ...this.getQuery(), freezedAt: { $exists: true } });
        this.setUpdate({ ...update, $unset: { freezedAt: 1 } });
    }
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
UserScehma.pre(["deleteOne", "findOneAndDelete"], async function () {
    const query = this.getQuery();
    const user = await this.model.findOne(query);
    if (!user) {
        throw new exception_1.NotFoundException("User not found");
    }
    ;
    const force = query?.force;
    if (!user.deletedAt && !force) {
        throw new exception_1.BadRequestException("Account is not soft deleted. Use force delete to permanently remove it.");
    }
    this.setQuery({ ...query });
    await post_model_1.PostModel.deleteMany({ userId: query._id });
});
UserScehma.pre("aggregate", function () {
    const opts = this.options || {};
    if (opts.allowDeleted === false) {
        this.pipeline().unshift({ $match: { deletedAt: { $exists: false } } });
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", UserScehma);
