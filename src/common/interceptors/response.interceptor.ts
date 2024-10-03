import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import e from 'express';
  import { Observable, map } from 'rxjs';
import { ResponseMessageKey } from '../decorator/response.decorator';
//   import { ResponseMessageKey } from '../decorator/response.decorator';
  
  export interface Response<T> {
    data: T;
  }
  
  @Injectable()
  export class TransformationInterceptor<T>
    implements NestInterceptor<T, Response<T>>
  {
    constructor(private reflector: Reflector) {}
  
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T>> {
      const responseMessage =
        this.reflector.get<string>(ResponseMessageKey, context.getHandler()) ??
        null;
  
      const request = context.switchToHttp().getRequest<Request>();
  
      return next.handle().pipe(
        map((data) => {
          if (request.url.includes('providus/hook')) {
            return data;
          }
          return {
            success:
              context.switchToHttp().getResponse().statusCode === 201 ||
              context.switchToHttp().getResponse().statusCode === 200,
            data: data,
            message:
              request.url.includes('/bill/') ||
              request.url.includes('/transaction/')
                ? data?.response_description ?? responseMessage ?? null
                : responseMessage ?? data?.response_description ?? null,
          };
        }),
      );
    }
  }
  