import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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

  // ✅ Generate a random OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ✅ Send email helper function
  private async sendEmail(email: string, subject: string, text: string): Promise<void> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new InternalServerErrorException('Email credentials not configured');
    }

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

  // ✅ User Signup
  async signup(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { firstname, lastname, email, password, address, phonenumber } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new BadRequestException('User already exists');

    // Generate OTP & hash password
    const otpCode = this.generateOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new this.userModel({
      firstname,
      lastname,
      email,
      address,
      phonenumber,
      password: hashedPassword,
      otpCode,
      otpexpires: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
    });

    try {
      await newUser.save();
      await this.sendEmail(email, 'Your OTP Code', `Your OTP is: ${otpCode}`);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }

    return { message: 'OTP sent. Verify your account.' };
  }

  // ✅ Verify OTP
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, otpCode } = verifyOtpDto;
    const user = await this.userModel.findOne({ email });

    if (!user || user.otpCode !== otpCode.toString() || new Date(user.otpexpires) < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.otpCode = undefined;
    user.otpexpires = undefined;
    user.isVerified = true;

    await user.save();
    return { message: 'Account successfully verified' };
  }

  // ✅ User Login
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Generate tokens
    const payload = { userId: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '14d' });

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ✅ Refresh Token
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    if (!token) throw new UnauthorizedException('Refresh token is required');

    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findOne({ _id: decoded.userId, refreshToken: token });

      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const newAccessToken = this.jwtService.sign(
        { userId: user._id, role: user.role },
        { expiresIn: '15m' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ✅ Logout (Clear Refresh Token)
  async logout(userId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    user.refreshToken = undefined;
    await user.save();

    return { message: 'User logged out successfully' };
  }

  // ✅ Forgot Password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');

    const resetToken = this.jwtService.sign({ userId: user._id }, { expiresIn: '1h' });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await user.save();
    const resetLink = `http://example.com/reset-password?token=${resetToken}`;
    await this.sendEmail(email, 'Reset Password Request', `Reset your password: ${resetLink}`);
  }

  // ✅ Reset Password
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

    await user.save();
  }
}
