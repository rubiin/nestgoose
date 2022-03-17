import {
	Body,
	Controller, Post,
	Put
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OtpVerifyDto, SendOtpDto } from './dtos/otp';
import { ResetPasswordDto } from './dtos/reset-password';
import { UserLoginDto } from './dtos/user-login';

@ApiTags('Auth routes')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) {}

	@ApiOperation({ summary: 'Login user' })
	@Post('login')
	async login(@Body() userLoginDto: UserLoginDto) {
		return this.authService.login(userLoginDto);
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
