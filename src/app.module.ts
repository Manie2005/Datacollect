import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller'; // AuthController
import { AuthService } from './auth/auth.service'; // AuthService
import { User, UserSchema } from './schemas/user.schema'; // User schema
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { Admin, AdminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      envFilePath: '.env', // Path to your environment file
    }),
    MongooseModule.forRoot(process.env.DB_URI), // MongoDB connection
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register User schema
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]), // Register User schema

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'CANDYMAN', // You can use an environment variable for this
      signOptions: { expiresIn: '60s' }, // You can adjust the expiration time
    }),AdminModule, AuthModule
  ],

  controllers: [AuthController], // AuthController
  providers: [AuthService], // AuthService
})
export class AppModule {}
