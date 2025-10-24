import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignUpDto, SignInDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import { UserRole, UserStatus } from '../user/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    const { email, password, username, role } = signUpDto;

    try {
      const user = await this.userService.create({
        email,
        password,
        username: username || email.split('@')[0], // Use email prefix if username not provided
        role: (role as UserRole) || UserRole.USER,
      });

      const tokens = await this.generateTokens({
        sub: (user as any)._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: (user as any)._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: (user as any).fullName,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const { email, password } = signInDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (await this.userService.isAccountLocked((user as any)._id.toString())) {
      throw new ForbiddenException('Account is temporarily locked due to multiple failed login attempts');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // Validate password
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      // Increment login attempts
      await this.userService.incrementLoginAttempts((user as any)._id.toString());
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.userService.resetLoginAttempts((user as any)._id.toString());

    const tokens = await this.generateTokens({
      sub: (user as any)._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: (user as any).fullName,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.userService.findById(payload.sub);
      
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.generateAccessToken({
        sub: (user as any)._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      });

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    await this.userService.updatePassword((user as any)._id.toString(), newPassword);

    return { message: 'Password reset successfully' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.userService.setPasswordResetToken(email, resetToken);

    // TODO: Send email with reset token
    // For now, just return the token (remove this in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  private async generateTokens(payload: JwtPayload): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { access_token, refresh_token };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'default-secret-key',
      expiresIn: '15m', // Short-lived access token
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.sub, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
        expiresIn: '7d', // Long-lived refresh token
      },
    );
  }

  async validateUser(userId: string) {
    const user = await this.userService.findById(userId);
    return !!(user && user.status === UserStatus.ACTIVE);
  }
}
