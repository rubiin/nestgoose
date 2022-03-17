import { IsNotEmpty, Length, Matches } from 'class-validator';
import { IsPassword } from '@common/validators/is-password.validator';

export class CreateUserDto {
	@IsNotEmpty()
	@Matches(/^9(7|8)\d{8}$/, {
		message: 'Phone number must be 10 digits long and start with 98 or 97',
	})
	phoneNumber!: string;

	@IsNotEmpty()
	@IsPassword()
	password!: string;

	@IsNotEmpty()
	@Length(6, 30, {
		message: 'Full name must be between 6 and 30 characters long',
	})
	fullName!: string;
}
