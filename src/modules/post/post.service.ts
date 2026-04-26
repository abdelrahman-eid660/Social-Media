import { HydratedDocument, Types } from 'mongoose';
import { notificationService, S3Service } from '../../common/service';
import { PostRepository } from './../../DB/Repository/post.repository';
import { IPost, IUser, StorageApproachEnum, UploadApproachEnum } from '../../common/enum';
import { UserRepository } from '../../DB/Repository';
import { BadRequestException, NotFoundException } from '../../common/exception';
import { APPLICATION_NAME, AWS_CLOUDFRONT_LINK } from '../../config/config';
class PostService {
    private readonly PostRepository : PostRepository
    private readonly UserRepository : UserRepository
    private s3 : S3Service
    constructor(){
        this.UserRepository = new UserRepository()
        this.PostRepository = new PostRepository()
        this.s3 = new S3Service()
    }

    //useing CloudFront
    // async createPost(user : HydratedDocument<IUser> , data : HydratedDocument<IPost> & {token? : string} ) : Promise<IPost>{
    //     let image = data?.attachments?.image || []
    //     let video = data?.attachments?.video || []
    //     if (image) {
    //         image = [...image].map(ele=> `${AWS_CLOUDFRONT_LINK}/${ele}` )
    //     }
    //     if (video) {
    //         video = [...video].map(ele=> `${AWS_CLOUDFRONT_LINK}/${ele}` )
    //     }
    //     const { mentions , tags} = data
    //     const mentionedUsers  = await this.UserRepository.find({filter : {_id : {$in : mentions as Types.ObjectId[] }}})
    //     if (mentions?.length && mentionedUsers.length !== mentions.length) {
    //         throw new NotFoundException("Some mentioned users are invalid");
    //     }       
    //     const taggedUsers = await this.UserRepository.find({filter : {_id : {$in : tags as Types.ObjectId[]}}})       
    //     if (tags?.length && taggedUsers.length !== tags.length) {
    //         throw new NotFoundException("Some tagged users are invalid");
    //     }
    //     const post = await this.PostRepository.create({data : {...data , userId : user._id , attachments : {image , video}}})
    //     await notificationService.sendNotification({token : data.token as string , data : {title : "Done" , body : "Publish your post successful"}})
    //     return post
    // }

    // Create Post
    async createPost(user : HydratedDocument<IUser> , data : HydratedDocument<IPost> & {token? : string} ) : Promise<IPost>{
        const { mentions , tags} = data
        const mentionedUsers  = await this.UserRepository.find({filter : {_id : {$in : mentions as Types.ObjectId[] }}})
        if (mentions?.length && mentionedUsers.length !== mentions.length) {
            throw new NotFoundException("Some mentioned users are invalid");
        }       
        const taggedUsers = await this.UserRepository.find({filter : {_id : {$in : tags as Types.ObjectId[]}}})       
        if (tags?.length && taggedUsers.length !== tags.length) {
            throw new NotFoundException("Some tagged users are invalid");
        }
        const post = await this.PostRepository.create({data : {...data , userId : user._id}})
        await notificationService.sendNotification({token : data.token as string , data : {title : "Done" , body : "Publish your post successful"}})
        return post
    }
    async createPresignedLink({ContentType , OriginalName} : {ContentType : string , OriginalName : string}) : Promise<{url : string , Key : string}>{
        if (!ContentType && !OriginalName) {
          throw new BadRequestException("Bad Request check from your Data")
        }
        const {url , Key} =  await this.s3.createPreSignedUploadLink({ContentType , OriginalName , path :`posts` })
        return {url , Key} 
    } 
}
export const postService = new PostService()