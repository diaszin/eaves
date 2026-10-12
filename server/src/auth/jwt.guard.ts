import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status: any,
  ) {
    // Se houver um erro de validação do JWT (ex: token expirado, assinatura inválida)
    // ou se nenhum usuário for encontrado/retornado pela estratégia
    if (err || info || !user) {
      throw (
        err ||
        new ForbiddenException('Acesso negado  : Token inválido ou expirado.')
      );
    }

    return user;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
