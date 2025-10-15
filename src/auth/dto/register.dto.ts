import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(6)
  // require at least one letter and one number
  // pattern: contains at least one letter and one digit
  @Matches(/(?=.*[A-Za-z])(?=.*\d).+/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // role can be 'user' or 'employee'. Employees need admin approval
  @IsOptional()
  @IsIn(['user', 'employee'])
  role?: string;
}
