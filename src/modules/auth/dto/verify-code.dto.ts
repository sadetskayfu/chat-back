import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty } from "class-validator"
import { VERIFICATION_TYPE } from "src/shared/types/verification-type"

export class VerifyCodeDto {
    @ApiProperty()
    userId: number

    @ApiProperty()
    @IsNotEmpty()
    code: string

    @ApiProperty({
        enum: ['EMAIL', 'PHONE'],
        example: 'EMAIL'
    })
    @IsEnum(['EMAIL', 'PHONE'])
    type: VERIFICATION_TYPE
}