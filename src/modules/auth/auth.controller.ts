import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OtpVerifyDto, SendOtpDto } from './dtos/otp';
import { ResetPasswordDto } from './dtos/reset-password';
import { UserLoginDto } from './dtos/user-login';
import { TwilioService } from '@lib/twilio/twilio.service';

@ApiTags('Auth routes')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly twilioService: TwilioService,
	) {}

	@ApiOperation({ summary: 'Login user' })
	@Post('login')
	async login(@Body() _userLoginDto: UserLoginDto) {
		return this.twilioService.sendSms('hello fom nest', '9817385479');
	}

	@Post('reset-password')
	async resetUserPassword(@Body() resetPwd: ResetPasswordDto) {
		return this.authService.resetPassword(resetPwd);
	}

	@Put('forgot-password')
	async forgotPassword(@Body() sendOtp: SendOtpDto) {
		return this.authService.forgotPassword(sendOtp);
	}

	@Post('verify-otp')
	async verifyOtp(@Body() otpDto: OtpVerifyDto) {
		return this.authService.verifyOtp(otpDto);
	}
}
