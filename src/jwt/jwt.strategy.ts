import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey', // Ensure this matches your environment variable
    });
  }

  async validate(payload: any) {
    // Check if the user has the required admin role
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Access restricted to admins only');
    }
    return payload; // This payload will be available in request.user
  }
}
