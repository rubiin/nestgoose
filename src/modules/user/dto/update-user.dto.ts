import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsNotEmpty()
	@MaxLength(50)
	address!: string;

	@IsNotEmpty()
	@IsEmail()
	email!: string;
}
