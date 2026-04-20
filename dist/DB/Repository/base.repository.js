"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options }) {
        const [doc] = await this.model.create(data, options);
        return doc;
    }
    async find({ filter, projection, options }) {
        return await this.model.find(filter || {}, projection, options);
    }
    async findOne({ filter, projection, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async findById({ _id, projection, options }) {
        const doc = this.model.findById(_id, projection);
        if (options?.lean) {
            doc.lean();
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async updateOne({ filter = {}, update, options }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async updateMany({ filter = {}, update, options }) {
        return await this.model.updateMany(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter = {}, update, options }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findByIdAndUpdate({ _id, update, options }) {
        return await this.model.findByIdAndUpdate(_id, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter = {} }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter = {} }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndDelete({ filter = {}, options }) {
        return await this.model.findOneAndDelete(filter, options);
    }
    async findByIdAndDelete({ _id, options }) {
        return await this.model.findByIdAndDelete(_id, options);
    }
    async aggregate(pipeline, options) {
        const Pipeline = pipeline.length ? pipeline : [{ $match: {} }];
        return this.model.aggregate(Pipeline, options);
    }
}
exports.BaseRepository = BaseRepository;
