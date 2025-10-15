import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Request } from 'express';
import { JwtPayload } from './jwt.util';

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;
    if (!user || !Array.isArray(user.roles))
      throw new ForbiddenException('No roles');
    const has = user.roles.some((r: string) => requiredRoles.includes(r));
    if (!has) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
