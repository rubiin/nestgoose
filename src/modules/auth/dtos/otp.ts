import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class OtpVerifyDto {
	@IsNotEmpty()
	otpCode!: string;

	@IsNotEmpty()
	@Matches(/^9(7|8)\d{8}$/)
	phoneNumber!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, [
	'phoneNumber',
] as const) {}
