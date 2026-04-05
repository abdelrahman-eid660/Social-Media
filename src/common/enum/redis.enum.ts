export const RedisActionsEnum = {
    Request : "REQUEST",
    BlockRequest : "BLOCK::REQUEST",
    BlockLogin : "BLOCK::LOGIN",
    BlockForgetPassword : "BLOCK::FOGET::PASSWORD",
    BlockTwoStepVerification : "BLOCK::TWO::STEP::VERIFICATION",
}
export const RedisTypeEnum = {
    ConfirmEmail : "Confirm::Email",
    Login : "LOGIN",
    ForgetPassword : "FORGET::PASSWORD",
    ResetPassword : "RESET::PASSWORD",
    TwoStepVerification : "TWO::STEP::VERIFICATION",
}