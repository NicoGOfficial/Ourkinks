import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    if (request.headers.authorization) {
      const decodded = this.authService.verifyJWT(
        request.headers.authorization
      );
      if (decodded) {
        const user = request.user
          || (await this.authService.getSourceFromJWT(
            request.headers.authorization
          ));
        if (user) request.user = user;
      }
    }
    return next.handle().pipe(map((value) => (value === null ? '' : value)));
  }
}
