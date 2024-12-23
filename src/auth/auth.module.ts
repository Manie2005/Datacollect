import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtStrategy } from 'src/jwt/jwt.strategy'; // Import the JwtStrategy
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';// Import the JwtAuthGuard
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'CANDYMAN', // Add your secret here or use .env
      signOptions: { expiresIn: '1h' },  // Set JWT expiration time
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, ConfigService],
  controllers: [AuthController],
  exports: [JwtAuthGuard],  // Export the JwtAuthGuard if you want to use it in other modules
})
export class AuthModule {}
