import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtStrategy } from 'src/jwt/jwt.strategy'; 
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available for env variables
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'CANDYMAN',
        signOptions: { expiresIn: '15m' }, // Use short-lived tokens
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, ConfigService],
  controllers: [AuthController],
  exports: [JwtAuthGuard, AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}
