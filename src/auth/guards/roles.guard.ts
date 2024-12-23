import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';  // If you have a JWT Auth Guard

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler()); // Get the role metadata
    if (!requiredRole) return true;  // If no role is required, let the request pass through

    const request = context.switchToHttp().getRequest();
    const user = request.user; // You should have user info populated in request (via JWT)

    return user && user.role === requiredRole;  // Check if the user's role matches the required role
  }
}
