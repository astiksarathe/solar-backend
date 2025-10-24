import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/permissions.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole, UserStatus } from './user.schema';
import type { AuthUser } from '../auth/interfaces/auth.interface';
import { SecurityAudit } from '../audit/decorators/audit.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: any;
}

class UpdateUserRoleDto {
  role: UserRole;
}

class UpdateUserStatusDto {
  status: UserStatus;
}

class QueryUsersDto {
  role?: UserRole;
  status?: UserStatus;
  limit?: number;
  skip?: number;
}

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'list_users' },
  })
  @ApiOperation({ summary: 'Get all users (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.userService.findAll({
      role: query.role,
      status: query.status,
      limit: query.limit ? parseInt(query.limit.toString()) : 50,
      skip: query.skip ? parseInt(query.skip.toString()) : 0,
    });
  }

  @Get('profile')
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'view_own_profile' },
  })
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getOwnProfile(@GetUser() user: AuthUser) {
    const fullUser = await this.userService.findById(user.userId);
    return { user: fullUser };
  }

  @Put('profile')
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'update_own_profile' },
  })
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateOwnProfile(
    @GetUser() user: AuthUser,
    @Body() updateData: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateProfile(
      user.userId,
      updateData,
    );
    return { user: updatedUser };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'view_user_profile' },
  })
  @ApiOperation({ summary: 'Get user by ID (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'update_user_profile' },
  })
  @ApiOperation({ summary: 'Update user profile (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const updatedUser = await this.userService.updateProfile(id, updateData);
    return { user: updatedUser };
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'update_user_role' },
  })
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateData: UpdateUserRoleDto,
  ) {
    const updatedUser = await this.userService.updateRole(id, updateData.role);
    return { user: updatedUser };
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'update_user_status' },
  })
  @ApiOperation({ summary: 'Update user status (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateData: UpdateUserStatusDto,
  ) {
    const updatedUser = await this.userService.updateStatus(
      id,
      updateData.status,
    );
    return { user: updatedUser };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'delete_user' },
  })
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/unlock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @SecurityAudit({
    entityType: 'User',
    module: 'USER_MANAGEMENT',
    additionalMetadata: { operation: 'unlock_user_account' },
  })
  @ApiOperation({ summary: 'Unlock user account (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Account unlocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async unlockAccount(@Param('id') id: string) {
    await this.userService.resetLoginAttempts(id);
    return { message: 'Account unlocked successfully' };
  }
}