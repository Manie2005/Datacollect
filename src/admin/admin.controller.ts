import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from 'src/dto/login-user.dto';// Assuming you have a LoginDto for validation
import { UnauthorizedException } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
