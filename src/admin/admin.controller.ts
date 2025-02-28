import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from 'src/dto/login-user.dto';
import { CreateAdminDto } from 'src/dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Admin Signup
  @Post('signup')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    try {
      const admin = await this.adminService.createAdmin(createAdminDto);
      return {
        success: true,
        message: 'Admin account created successfully',
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Admin Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.adminService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.adminService.generateJwtToken(admin);
  }
}
