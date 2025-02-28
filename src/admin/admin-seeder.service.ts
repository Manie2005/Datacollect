import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from 'src/schemas/admin.schema';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<Admin>) {}

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecurePass123';

    const existingAdmin = await this.adminModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await this.adminModel.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin account seeded successfully');
    }
  }
}
