import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema';
import { CreateAdminDto } from 'src/dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  // Create a new admin
  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { email, password } = createAdminDto;
    
    // Check if admin already exists
    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new BadRequestException('Admin already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = new this.adminModel({
      email,
      password: hashedPassword,
      role: 'admin', // Ensure role is set
    });

    return admin.save();
  }

  // Validate Admin Login
  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) return null;

    const isMatch = await bcrypt.compare(password, admin.password);
    return isMatch ? admin : null;
  }

  // Generate JWT Token with a success message
  async generateJwtToken(admin: Admin) {
    const payload = { email: admin.email, role: 'admin' };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Admin logged in successfully',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
