import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Fetch a single user by email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  // Fetch a user by ID
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Fetch the authenticated user's profile (by ID)
  async getProfile(id: string): Promise<User> {
    const user = await this.findById(id);
    return user;
  }

  // Update a user's profile
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).exec();
      if (!updatedUser) {
        throw new BadRequestException('Failed to update user profile');
      }
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error updating user profile');
    }
  }

  // Delete a user
  async deleteUser(userId: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new BadRequestException('User not found or already deleted');
    }
  }

  // Block a user
  async blockUser(userId: string): Promise<User> {
    try {
      const user = await this.findById(userId);
      if (user.isBlocked) {
        throw new BadRequestException('User is already blocked');
      }
      user.isBlocked = true;
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Error blocking user');
    }
  }

  // Fetch all users (admin functionality)
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
