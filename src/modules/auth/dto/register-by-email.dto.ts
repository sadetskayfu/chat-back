import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsValidPassword } from 'src/shared/validators/password-validator';

export class RegisterByEmailDto {
	@ApiProperty()
	@IsEmail({}, { message: 'Email is not valid' })
	email: string;

	@ApiProperty()
	@IsNotEmpty({ message: 'Password cannot be empty' })
	@IsValidPassword()
	password: string;
}
