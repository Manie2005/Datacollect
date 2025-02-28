import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from 'src/dto/login-user.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateAdminDto } from 'src/dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Admin Signup
  @Post('signup')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  // Admin Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.adminService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.adminService.generateJwtToken(admin);
    return { success: true, token };
  }
}
