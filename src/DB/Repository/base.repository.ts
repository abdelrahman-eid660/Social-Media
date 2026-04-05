import { CreateOptions, HydratedDocument, Model, QueryFilter, QueryOptions ,  } from "mongoose";
import { IUser } from "../../common/enum";

export abstract class BaseRepository<TRawDocument> {
    constructor(protected readonly model : Model<TRawDocument> ){}
    async create({data , options} : {data : Partial<TRawDocument>[] , options? : CreateOptions}) :  Promise<HydratedDocument<TRawDocument>[]>{
       return await this.model.create(data as any  , options) as HydratedDocument<TRawDocument>[]    
    }
    async createOne({data,options}: {data: Partial<TRawDocument>,options?: CreateOptions}): Promise<HydratedDocument<TRawDocument>> {
       const [doc] = await this.model.create(data as any, options) ;
       return doc as HydratedDocument<TRawDocument>
    }   
    async find({filter , options} : {filter? :  QueryFilter<TRawDocument> , options? : QueryOptions}) : Promise<HydratedDocument<TRawDocument>[]>{
        return await this.model.find(filter || {} , null,options)
    }
    async findOne({filter , options}: {filter: QueryFilter<TRawDocument> , options?: QueryOptions}): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findOne(filter, null, options).exec();
    }
}