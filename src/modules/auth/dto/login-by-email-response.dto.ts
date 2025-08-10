import { ApiProperty } from "@nestjs/swagger"

export class LoginByEmailResponseDto {
    @ApiProperty()
    userId: number

    @ApiProperty()
    message: string

    @ApiProperty()
    verificationCodeExpirationMinutes: number
}