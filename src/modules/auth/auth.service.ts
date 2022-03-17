import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { UserLoginDto } from '@modules/auth/dtos/user-login';
import { TokensService } from '@modules/token/tokens.service';
import { HelperService } from '@common/helpers/helpers.utils';
import { Otp, User } from '@models';
import { Model } from 'mongoose';
import { IResponse } from '@common/interfaces/response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from 'models/userModel';
import { ResetPasswordDto } from './dtos/reset-password';
import { OtpDocument } from 'models/otpModel';
import { OtpVerifyDto, SendOtpDto } from './dtos/otp';
import { isAfter } from 'date-fns';
import { convertStringIdToObjectId } from '@common/misc/misc';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userRepository: Model<UserDocument>,
		@InjectModel(Otp.name) private otpRepository: Model<OtpDocument>,

		private readonly tokenService: TokensService,
	) {}

	/**
	 *
	 *
	 * @param {UserLoginDto} userDto
	 * @return {Promise<ILoginSignupReponse>}
	 * @memberof AuthService
	 */
	async login(userDto: UserLoginDto): Promise<IResponse<any>> {
		const userExists = await this.userRepository.findOne({
			phoneNumber: userDto.phoneNumber,
		});

		if (!userExists) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
			phoneNumber: userExists.phoneNumber,
			isRegistrationComplete: userExists.isRegistrationComplete,
		};

		const token = await this.tokenService.generateAccessToken(userExists);

		const payload = HelperService.buildPayloadResponse(user, token);

		return {
			data: payload,
		};
	}

	async forgotPassword(sendOtp: SendOtpDto) {
		// const { phoneNumber } = sendOtp;
		// const userExists = await this.userRepository.findOne({ phoneNumber });
		// if (!userExists) {
		// 	throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		// }
		// const payload = {
		// 	phoneNumber: userExists.phoneNumber,
		// 	user: userExists._id,
		// };
	}

	async resetPassword(resetPassword: ResetPasswordDto) {
		const { password, otpCode } = resetPassword;
		const details = await this.otpRepository
			.findOne({
				verificationCode: otpCode,
			})
			.exec();

		return this.userRepository.findOneAndUpdate(
			{ _id: details.user },
			{ password },
			{ new: true },
		);
	}

	async verifyOtp(otpDto: OtpVerifyDto) {
		const { phoneNumber, otpCode } = otpDto;
		const codeDetails = await this.otpRepository
			.findOne({
				verificationCode: otpCode,
				phoneNumber,
			})
			.exec();

		if (!codeDetails) {
			throw new HttpException('Otp not found', HttpStatus.NOT_FOUND);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiryDate));
		if (isExpired) {
			throw new HttpException('Otp expired', HttpStatus.FORBIDDEN);
		}

		const otp = this.otpRepository.findByIdAndUpdate(
			convertStringIdToObjectId(codeDetails),
			{
				$set: {
					isUsed: true,
				},
			},
		);

		const user = this.userRepository.findByIdAndUpdate(
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
