import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login-user.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Generate a random OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send email (helper function)
  private async sendEmail(email: string, subject: string, text: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      host: 'smtp.gmail.com',
      port: 465,
    });

    if (!email || !subject || !text) throw new BadRequestException('Email details are incomplete');

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error sending email');
    }
  }

  // User Signup
  async signup(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { firstname, lastname, email, password, address, phonenumber } = createUserDto;
  
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new BadRequestException('User already exists');
  
    // Generate OTP and hash password
    const otpCode = this.generateOtp();
    const hashedPassword = await bcrypt.hash(password, 12);
  
    // Create a new user object
    const newUser = new this.userModel({
      firstname,
      lastname,
      email,
      address,
      phonenumber,
      password: hashedPassword,
      otpCode,
      otpexpires: new Date(Date.now() + 15 * 60 * 1000),
    });
  
    try {
      // Save the user
      await newUser.save();
  
      // Send OTP email
      await this.sendEmail(email, 'Your OTP Code', `Your OTP is: ${otpCode}`);
    } catch (error) {
      console.error('Error during user signup:', error); // Log the error
      throw new InternalServerErrorException('Error saving user');
    }
  
    return { message: 'OTP sent. Verify your account.' };
  }
  

  // Verify OTP
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, otpCode } = verifyOtpDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid email or OTP');
    }

    const otpExpiration = new Date(user.otpexpires);
    if (user.otpCode !== otpCode.toString() || otpExpiration < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update the user's verification status
    user.otpCode = undefined;
    user.otpexpires = undefined;
    user.isVerified = true;

    try {
      await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating user verification status');
    }

    return { message: 'Account successfully verified' };
  }
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
  
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  
    const token = this.jwtService.sign({
      userId: user._id,
      role: user.role, // Include the role in the token payload
    });
  
    return {
      success: true,
      message: 'User logged in successfully',
      accessToken: token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    };
  }
  

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');

    const resetToken = this.jwtService.sign({ userId: user._id }, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    
    try {
      await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Error saving reset token');
    }

    const resetLink = `http://example.com/reset-password?token=${resetToken}`;
    await this.sendEmail(email, 'Reset Password Request', `Reset your password: ${resetLink}`);
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    try {
      await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating password');
    }
  }
}
 