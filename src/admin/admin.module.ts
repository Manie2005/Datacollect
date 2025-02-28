import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../schemas/admin.schema';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'CANDYMAN',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AdminService, JwtStrategy, JwtAuthGuard, ConfigService],
  controllers: [AdminController],
  exports: [JwtAuthGuard],
})
export class AdminModule {} 
