import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, UserStatus } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: {
    email: string;
    username: string;
    password: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === userData.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    return user.save();
  }

  async findAll(options?: {
    role?: UserRole;
    status?: UserStatus;
    limit?: number;
    skip?: number;
  }): Promise<{ users: User[]; total: number }> {
    const filter: any = {};
    
    if (options?.role) filter.role = options.role;
    if (options?.status) filter.status = options.status;

    const total = await this.userModel.countDocuments(filter);
    const users = await this.userModel
      .find(filter)
      .limit(options?.limit || 50)
      .skip(options?.skip || 0)
      .sort({ createdAt: -1 });

    return { users, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).select('+password');
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      })
      .select('+password');
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { 
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        loginAttempts: 0,
        lockUntil: undefined,
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    metadata?: any;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    const updates: any = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 15 minutes
    if (user.loginAttempts + 1 >= 5) {
      updates.$set = {
        lockUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };
    }

    await this.userModel.findByIdAndUpdate(userId, updates);
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      lastLogin: new Date(),
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    return !!(user?.lockUntil && user.lockUntil > new Date());
  }

  async setPasswordResetToken(email: string, token: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }
    );
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
