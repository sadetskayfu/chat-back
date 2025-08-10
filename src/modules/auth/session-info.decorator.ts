import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const SessionInfo = createParamDecorator((_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as Request
    return request['session']
})