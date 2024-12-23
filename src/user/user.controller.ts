import { Body, Controller, Get, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard'; // Assuming JwtAuthGuard is in the auth folder

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('id/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // Profile route to get the authenticated user's profile
  @UseGuards(JwtAuthGuard)  // Protect the route with JWT Auth Guard
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user._id;  // Get user ID from the request (set by JwtAuthGuard)
    return this.userService.findById(userId);  // Fetch user profile by user ID
  }

  @Patch(':id')
  async updateUserProfile(
    @Param('id') id: string, 
    @Body() updateData: Partial<any>,
  ) {
    return this.userService.updateProfile(id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
