import { ApiProperty } from "@nestjs/swagger"

export class RegisterByEmailResponseDto {
    @ApiProperty()
    userId: number

    @ApiProperty()
    email: string

    @ApiProperty()
    message: string

    @ApiProperty()
    verificationCodeExpirationMinutes: number
}