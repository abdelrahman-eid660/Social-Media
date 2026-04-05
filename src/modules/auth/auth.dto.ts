export interface ILoginDTO {
    userName? : string,
    password : string,
    email : string
}
export interface ISignupDTO extends ILoginDTO {
    userName : string,
}