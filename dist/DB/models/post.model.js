"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const PostScehma = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
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
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    mentions: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    availability: {
        type: Number,
        enum: enum_1.availabilityEnum,
        default: enum_1.availabilityEnum.PUBLIC
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    restoredAt: {
        type: Date,
        default: null,
    },
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", PostScehma);
