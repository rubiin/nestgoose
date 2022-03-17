import { GetPaginationQuery } from '@common/classes/pagnation';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { convertStringIdToObjectId } from '@common/misc/misc';
import { User, UserDocument } from '../../models/userModel';
import { HelperService } from '@common/helpers/helpers.utils';
import { randomTypes } from '@common/constants/random-types.enum';
import { TwilioService } from '@lib/twilio/twilio.service';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly twilioService: TwilioService,
	) {}

	async create(createUserDto: CreateUserDto) {
		const userExists = await this.userModel.findOne({
			phoneNumber: createUserDto.phoneNumber,
			isVerified: true,
		});

		if (userExists) {
			throw new HttpException(
				'User already exists',
				HttpStatus.BAD_REQUEST,
			);
		}
		const user = new this.userModel(createUserDto);
		const code = HelperService.getRandom(randomTypes.NUMBER, 6);

		await this.twilioService.sendSms(
			'Your verification code is: ' + code,
			user.phoneNumber,
		);

		return user.save();
	}

	async findAll(options: GetPaginationQuery) {
		const data = await this.userModel
			.aggregate([
				{
					$facet: {
						pagination: [
							{ $count: 'total' },
							{ $addFields: { page: options.page } },
						],
						docs: [
							{
								$skip:
									(options.page - 1) *
									(options.limit ? options.limit : 10),
							},
							{
								$limit: options.limit ? options.limit : 10,
							},
						],
					},
				},
			])
			.allowDiskUse(true);

		const desiredDocs = data[0].docs ? data[0].docs : [];
		const pagination =
			data[0].pagination && data[0].pagination[0] !== undefined
				? data[0].pagination[0]
				: {
						total: 0,
						page: options.page,
				  };

		return {
			pagination,
			docs: desiredDocs,
		};
	}

	findOne(id: string) {
		return this.userModel.findById(id).lean().exec();
	}

	update<T extends UpdateUserDto>(id: number, updateUserDto: T) {
		const data = {
			...updateUserDto,
			profilePic: updateUserDto.profilePic,
			isRegistrationComplete: true,
		};

		return this.userModel.findByIdAndUpdate(
			{
				_id: convertStringIdToObjectId(id),
			},
			{
				$set: data,
			},
			{ useFindAndModify: false, new: true },
		);
	}
}
