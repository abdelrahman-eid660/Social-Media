import express from "express"
import cors from 'cors'
import { AuthRouter, UserRouter } from "./modules"
import { globalErrorHandelr } from "./middleware/error.middleware"
import { connectDB } from "./DB"
import { redisService } from "./common/service"
async function bootstrap() {
    const app : express.Express = express()

    //DB 
    await connectDB()
    //REDIS
    await redisService.connect()
    
    // Global Middleware
    app.use(cors() ,  express.json())

    app.get("/" , (req :  express.Request , res : express.Response)=>{
        res.send("Hello")
    })

    // App-routing
    app.use("/Echo/auth",AuthRouter)
    app.use("/Echo/profile",UserRouter)

    // Invalid route handling
    app.use('/*dummy' , (req : express.Request , res : express.Response , next : express.NextFunction)=>{
        res.status(404).json({message : "Not Found"})
    })
    // global error handling
    app.use(globalErrorHandelr)
    app.listen(3001 , ()=>{
        console.log("Server is running on port 3001");
    })
}
export default bootstrap 