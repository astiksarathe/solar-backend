import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ret.id = ret._id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete ret.__v;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete ret.password;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return ret;
    },
  },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 255,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default: 'user',
    enum: ['user', 'admin', 'moderator'],
  })
  role: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 50,
  })
  username: string;

  @Prop({ default: null })
  createdBy: string;

  @Prop({ default: null })
  updatedBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save middleware to generate username from email if not provided
UserSchema.pre('save', function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split('@')[0];
  }
  this.updatedAt = new Date();
  next();
});
