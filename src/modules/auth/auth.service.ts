import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserLoginDto } from '@modules/auth/dtos/user-login';
import { TokensService } from '@modules/token/tokens.service';
import { HelperService } from '@common/helpers/helpers.utils';
import { Otp, User } from '@models';
import { Model } from 'mongoose';
import { IResponse } from '@common/interfaces/response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ResetPasswordDto } from './dtos/reset-password';
import { OtpVerifyDto, SendOtpDto } from './dtos/otp';
import { isAfter } from 'date-fns';
import { convertStringIdToObjectId } from '@common/misc/misc';
import { OtpDocument } from '../../models/otpModel';
import { UserDocument } from '../../models/userModel';
import { randomTypes } from '@common/constants/random-types.enum';
import { TwilioService } from '@lib/twilio/twilio.service';
import { I18nRequestScopeService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
		private readonly tokenService: TokensService,
		private readonly twilioService: TwilioService,
		private readonly i18n: I18nRequestScopeService,
	) {}

	/**
	 *
	 *
	 * @param {UserLoginDto} userDto
	 * @return {Promise<ILoginSignupResponse>}
	 * @memberof AuthService
	 */
	async login(userDto: UserLoginDto): Promise<IResponse<any>> {
		const userExists = await this.userModel.findOne({
			phoneNumber: userDto.phoneNumber,
		});

		if (!userExists) {
			throw new HttpException(
				await this.i18n.translate('operations.USER_NOT_FOUND'),
				HttpStatus.NOT_FOUND,
			);
		}

		// check if the provided password match the stored password

		const isPasswordCorrect = await userExists.comparePassword(
			userDto.password,
		);

		if (!isPasswordCorrect) {
			throw new HttpException(
				'Invalid username/password',
				HttpStatus.BAD_REQUEST,
			);
		}

		const user = {
			user: userExists._id,
			id: userExists._id,
			phoneNumber: userExists.phoneNumber,
			isRegistrationComplete: userExists.isRegistrationComplete,
		};

		const token = await this.tokenService.generateAccessToken(user);

		const payload = HelperService.buildPayloadResponse(user, token);

		return {
			data: payload,
		};
	}

	async forgotPassword(sendOtp: SendOtpDto) {
		const { phoneNumber } = sendOtp;
		const userExists = await this.userModel.findOne({ phoneNumber });

		if (!userExists) {
			throw new HttpException(
				await this.i18n.translate('operations.USER_NOT_FOUND'),
				HttpStatus.NOT_FOUND,
			);
		}

		const otpNumber = HelperService.getRandom(randomTypes.NUMBER, 6); // random six digit otp
		const content = `Your OTP code for password reset is ${otpNumber}`;

		await this.twilioService.sendSms(phoneNumber, content);

		const otp = new this.otpModel({
			user: userExists._id,
			phoneNumber,
			verificationCode: otpNumber,
			expiryDate: new Date(
				Date.now() + 4 * 24 * 60 * 60 * 1000,
			).getTime(),
		});

		return otp.save();
	}

	async resetPassword(resetPassword: ResetPasswordDto) {
		const { password, otpCode } = resetPassword;
		const details = await this.otpModel
			.findOne({
				verificationCode: otpCode,
			})
			.exec();

		return this.userModel.findOneAndUpdate(
			{ _id: details.user },
			{ password },
			{ new: true },
		);
	}

	async verifyOtp(otpDto: OtpVerifyDto) {
		const { phoneNumber, otpCode } = otpDto;
		const codeDetails = await this.otpModel
			.findOne({
				verificationCode: otpCode,
				phoneNumber,
			})
			.exec();

		if (!codeDetails) {
			throw new HttpException(
				await this.i18n.translate('operations.OTP_NOT_FOUND'),
				HttpStatus.NOT_FOUND,
			);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiryDate));

		if (isExpired) {
			throw new HttpException(
				await this.i18n.translate('operations.OTP_EXPIRED'),
				HttpStatus.BAD_REQUEST,
			);
		}

		const otp = this.otpModel.findByIdAndUpdate(
			convertStringIdToObjectId(codeDetails),
			{
				$set: {
					isUsed: true,
				},
			},
		);

		const user = this.userModel.findByIdAndUpdate(
			convertStringIdToObjectId(codeDetails.user),
			{
				$set: {
					isVerified: true,
				},
			},
		);

		await Promise.all([otp, user]);

		return 'Device has been verified successfully. Please login to continue';
	}
}
