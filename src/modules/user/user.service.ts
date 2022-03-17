import { GetPaginationQuery } from '@common/classes/pagnation';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserDocument, UserSchema } from 'models/userModel';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { convertStringIdToObjectId } from '@common/misc/misc';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userRepository: Model<UserDocument>,
	) {}

	async create(createUserDto: CreateUserDto) {
		const userExists = await this.userRepository.findOne({
			phoneNumber: createUserDto.phoneNumber,
			isVerified: true,
		});

		if (userExists) {
			throw new HttpException(
				'User already exists',
				HttpStatus.BAD_REQUEST,
			);
		}
		const user = new User(createUserDto);
		return user.save();
	}

	async findAll(options: GetPaginationQuery) {
		const data = await this.userRepository
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
		return this.userRepository.findById(id).lean().exec();
	}

	update<T extends UpdateUserDto>(id: number, updateUserDto: T) {
		const data = {
			...updateUserDto,
			profilePic: updateUserDto.profilePic,
			isRegistrationComplete: true,
		};
		return this.userRepository.findByIdAndUpdate(
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
