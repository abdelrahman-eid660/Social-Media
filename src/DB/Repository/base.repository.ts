import { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult ,  } from "mongoose";
import { AggregateOptions } from "node:sqlite";
export abstract class BaseRepository<TRawDocument> {
    constructor(protected readonly model : Model<TRawDocument> ){}
    async create({data} : {data : AnyKeys<TRawDocument>}) :  Promise<HydratedDocument<TRawDocument>>
    async create({data , options} : {data : AnyKeys<TRawDocument>[] , options? : CreateOptions}) :  Promise<HydratedDocument<TRawDocument>[]>
    async create({data , options} : {data : AnyKeys<TRawDocument>[] | AnyKeys<TRawDocument> , options? : CreateOptions}) :  Promise<HydratedDocument<TRawDocument>[] | HydratedDocument<TRawDocument>>{
       return await this.model.create(data as any  , options) 
    }
    async createOne({data,options}: {data: AnyKeys<TRawDocument>,options?: CreateOptions}): Promise<HydratedDocument<TRawDocument>> {
       const [doc] = await this.model.create(data as any, options) ;
       return doc as HydratedDocument<TRawDocument>
    }   
    async find({filter , projection , options} : {filter? :  QueryFilter<TRawDocument> , projection? : ProjectionType<TRawDocument>  , options? : QueryOptions}) : Promise<HydratedDocument<TRawDocument>[]>{
        return await this.model.find(filter || {} , projection , options)
    }
    async findOne({filter , projection , options}: {filter : QueryFilter<TRawDocument>, projection? : ProjectionType<TRawDocument> | null | undefined , options?: QueryOptions<TRawDocument> & {lean? : false , populate? : PopulateOptions[]}}): Promise<HydratedDocument<TRawDocument> | null>
    async findOne({filter , projection , options}: {filter : QueryFilter<TRawDocument>, projection? : ProjectionType<TRawDocument> | null | undefined, options?: QueryOptions<TRawDocument> & {lean? : true , populate? : PopulateOptions[]}}): Promise<FlattenMaps<TRawDocument> | null> 
    async findOne({filter , projection , options}: {filter : QueryFilter<TRawDocument>, projection? : ProjectionType<TRawDocument> | null | undefined  , options?: QueryOptions<TRawDocument>}): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null> {
        const doc = this.model.findOne(filter , projection)
        if (options?.lean) {doc.lean(options.lean)}
        if (options?.populate) {doc.populate(options.populate as PopulateOptions[])}
        return await doc.exec()
    }
    async findById({_id , projection , options}: {_id : Types.ObjectId, projection? : ProjectionType<TRawDocument> | null | undefined , options?: QueryOptions<TRawDocument> & {lean? : false , populate? : PopulateOptions[] | string}}): Promise<HydratedDocument<TRawDocument> | null>
    async findById({_id , projection , options}: {_id : Types.ObjectId, projection? : ProjectionType<TRawDocument> | null | undefined, options?: QueryOptions<TRawDocument> & {lean? : true , populate? : PopulateOptions[] | string}}): Promise<FlattenMaps<TRawDocument> | null> 
    async findById({_id , projection , options}: {_id : Types.ObjectId, projection? : ProjectionType<TRawDocument> | null | undefined  , options?: QueryOptions<TRawDocument>}): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null> {
        const doc = this.model.findById(_id , projection)
        if (options?.lean) {doc.lean()}
        if (options?.populate) {doc.populate(options.populate as PopulateOptions[])}
        return await doc.exec()
    }
    async updateOne({filter = {} , update , options}:{filter: QueryFilter<TRawDocument | any>,update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,options?: (MongooseUpdateQueryOptions<TRawDocument>) | null}):Promise<UpdateWriteOpResult>{
        return await this.model.updateOne(filter , {...update , $inc : {__v : 1}} , options)
    }
    async updateMany({filter = {} , update , options}:{filter: QueryFilter<TRawDocument>,update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,options?: (MongooseUpdateQueryOptions<TRawDocument>) | null}):Promise<UpdateWriteOpResult>{
        return await this.model.updateMany(filter ,  {...update , $inc : {__v : 1}} , options)
    }
    async findOneAndUpdate({filter = {} , update , options}:{filter: QueryFilter<TRawDocument>,update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,options?: (MongooseUpdateQueryOptions<TRawDocument>) | null}):Promise<HydratedDocument<TRawDocument> | null>{
        return await this.model.findOneAndUpdate(filter , {...update , $inc : {__v : 1}} , options) 
    }
    async findByIdAndUpdate({_id , update , options}:{_id: Types.ObjectId,update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,options?: (MongooseUpdateQueryOptions<TRawDocument>) | null}):Promise<HydratedDocument<TRawDocument> | null>{
        return await this.model.findByIdAndUpdate(_id ,  {...update , $inc : {__v : 1}} , options) 
    }
    async deleteOne({filter = {}}:{filter: QueryFilter<TRawDocument>}):Promise<DeleteResult>{
        return await this.model.deleteOne(filter)
    }
    async deleteMany({filter = {}}:{filter: QueryFilter<TRawDocument>}):Promise<DeleteResult>{
        return await this.model.deleteMany(filter)
    }
    async findOneAndDelete({filter = {} , options}:{filter: QueryFilter<TRawDocument> , options? : QueryOptions<TRawDocument>}):Promise<HydratedDocument<TRawDocument> | null>{
        return await this.model.findOneAndDelete(filter , options ) 
    }
    async findByIdAndDelete({_id , options}:{_id: Types.ObjectId, options? : QueryOptions<TRawDocument>}):Promise<HydratedDocument<TRawDocument> | null>{
        return await this.model.findByIdAndDelete(_id , options) 
    }
    async aggregate(pipeline : any[] , options?: Partial<AggregateOptions> & {allowDeleted : boolean}) {
        const Pipeline = pipeline.length ? pipeline : [{ $match: {} }];
        return this.model.aggregate(Pipeline, options);
    }
}