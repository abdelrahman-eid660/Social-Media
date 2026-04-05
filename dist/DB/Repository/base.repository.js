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
    async find({ filter, options }) {
        return await this.model.find(filter || {}, null, options);
    }
    async findOne({ filter, options }) {
        return await this.model.findOne(filter, null, options).exec();
    }
}
exports.BaseRepository = BaseRepository;
