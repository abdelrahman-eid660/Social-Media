"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const PostScehma = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
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
}, {
    strict: true,
    strictQuery: true,
    timestamps: true,
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", PostScehma);
