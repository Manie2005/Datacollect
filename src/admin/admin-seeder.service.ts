import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL || 'maniesamuel24@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'C@keMania2024';

    const existingAdmin = await this.userModel.findOne({ email: adminEmail, role: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await this.userModel.create({
        firstname: 'Admin',
        lastname: 'Account',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin account seeded successfully');
    }
  }
}
