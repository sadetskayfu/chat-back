import { ApiProperty } from "@nestjs/swagger";

export class VerifyCodeResponseDto {
    @ApiProperty()
    message: string
}