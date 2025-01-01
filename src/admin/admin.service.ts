import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin} from 'src/schemas/admin.schema'; // Use the schema

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  // Find the admin by email and check the password
  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      return null;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return null;
    }

    return admin;
  }

  // Generate a JWT token
  async generateJwtToken(admin: any) {
    const payload = { email: admin.email, role: 'admin' };
    return this.jwtService.sign(payload);
  }
}
