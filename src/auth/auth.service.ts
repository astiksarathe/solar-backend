import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignUpDto, SignInDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    const { email, password, username, role } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await this.userService.findByUsername(username);
      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Create user
    const user = await this.userService.create({
      email,
      password,
      username,
      role: role || 'user',
    });

    // Generate token
    const payload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const { email, password } = signInDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const payload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    // Update password
    await this.userService.updatePassword((user as any)._id.toString(), newPassword);

    return { message: 'Password reset successfully' };
  }

  async validateUser(userId: string) {
    return this.userService.findById(userId);
  }
}
