import { Types } from "mongoose";
import z from "zod";
export const generalValidationFields = {
    id: z.string().refine(val => Types.ObjectId.isValid(val), {message: "Invalid ObjectId"}),
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    email : z.string().email(),
    // password : z.string().regex(/^(?=.*[A-Z]){1,}(?=.*[a-z]){1,}(?=.*[\d]){1,}(?=.*[\W]){1,}[\W\w].{8,25}/), 
    password : z.string(), 
    confirmPassword : z.string(),
    userName : z.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    otp : z.string().regex(/^\d{6}$/),
    phone:z.string().regex(/^(02|2|\+20)?01[0-25]\d{8}$/),
    isTwoFactorEnabled : z.boolean(),
}
