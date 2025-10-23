import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import type { AuthUser } from './interfaces/auth.interface';
import {
  SecurityAudit,
  NoAudit,
} from '../audit/decorators/audit.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @SecurityAudit({
    entityType: 'User',
    module: 'AUTH',
    additionalMetadata: { operation: 'signup' },
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @SecurityAudit({
    entityType: 'User',
    module: 'AUTH',
    additionalMetadata: { operation: 'signin' },
  })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SecurityAudit({
    entityType: 'User',
    module: 'AUTH',
    additionalMetadata: { operation: 'signout' },
  })
  signOut() {
    // In a JWT-based auth system, signout is typically handled client-side
    // by removing the token. Here we just return a success message.
    return { message: 'Successfully signed out' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @SecurityAudit({
    entityType: 'User',
    module: 'AUTH',
    additionalMetadata: { operation: 'password_reset' },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @NoAudit()
  getProfile(@GetUser() user: AuthUser) {
    return {
      id: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}
