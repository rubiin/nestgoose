import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
	@IsNotEmpty()
	phoneNumber!: string;

	@IsNotEmpty()
	password!: string;
}
