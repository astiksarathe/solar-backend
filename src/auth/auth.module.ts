import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  providers: [AuthService, JwtAuthGuard, RolesGuard, Reflector],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
