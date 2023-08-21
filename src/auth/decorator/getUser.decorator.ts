import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // configurable based on the context
    const request: Express.Request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
