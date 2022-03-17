import { GetPaginationQuery } from '@common/classes/pagnation';
import { Event, Host, User } from '@models';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventDocument } from 'models/eventModel';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { convertStringIdToObjectId } from '@common/misc/misc';
import { InviteEventDto } from './dto/invite-dto';
import { UserDocument } from 'models/userModel';
import { Invitation, InvitationDocument } from 'models/invitationModel';
import { HostDocument } from 'models/hostModel';
import { Location, LocationDocument } from 'models/locationModel';
import { pick } from '@rubiin/js-utils';

@Injectable()
export class EventService {
	constructor(
		@InjectModel(Event.name) private eventRepository: Model<EventDocument>,
		@InjectModel(User.name) private userRepository: Model<UserDocument>,
		@InjectModel(Host.name) private hostRepository: Model<HostDocument>,
		@InjectModel(Location.name)
		private locationRepository: Model<LocationDocument>,
		@InjectModel(Invitation.name)
		private invitationRepository: Model<InvitationDocument>,
	) {}

	async createHost(data: any) {
		const newHost = pick(data, ['fullName', 'address', 'phoneNumber']);
		const host = new Host(newHost);
		return host.save();
	}

	async createLocation(data: any) {
		const location = new Location(data);
		return location.save();
	}

	async create<T extends CreateEventDto>(createEventDto: T, user: User) {
		const currentUser = await this.userRepository.find({
			_id: convertStringIdToObjectId(user._id),
		});

		const locationData = {
			city: createEventDto.city,
			state: createEventDto.state,
			zipCode: createEventDto.zipCode,
			latitude: createEventDto.latitude,
			longitude: createEventDto.longitude,
		};

		const [host, location] = await Promise.all([
			this.createHost(currentUser),
			this.createLocation(locationData),
		]);

		createEventDto.host = host._id;
		createEventDto.location = location._id;

		const event = new Event(createEventDto);
		return user.save();
	}

	async inviteGuests(id: string, inviteDto: InviteEventDto) {
		const users = await this.userRepository.find({
			phoneNumber: { $in: inviteDto.phoneNumbers },
		});

		return this.invitationRepository.insertMany(
			users.map(user => {
				return { event: id, guest: user._id };
			}),
		);
	}

	async findAll(options: GetPaginationQuery) {
		let matchCondition = {
			startDateTime: { $gte: new Date() },
		} as any;

		if (options.type === 'past') {
			matchCondition = {
				startDateTime: { $lte: new Date() },
			};
		}

		const data = await this.eventRepository
			.aggregate([
				{
					$match: matchCondition,
				},

				{
					$lookup: {
						from: 'hosts',
						localField: 'host',
						foreignField: '_id',
						as: 'host',
					},
				},
				{
					$unwind: {
						path: '$host',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'locations',
						localField: 'location',
						foreignField: '_id',
						as: 'location',
					},
				},
				{
					$unwind: {
						path: '$location',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$addFields: {
						coverImageUrl: {
							$concat: [process.env.API_URL, '/', '$coverImage'],
						},
					},
				},
				{
					$facet: {
						pagination: [
							{ $count: 'total' },
							{ $addFields: { page: options.page } },
						],
						docs: [
							{
								$skip:
									(options.page - 1) * options.limit
										? options.limit
										: 10,
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

	async findOne(id: string, user: User) {
		const eventExists = await this.eventRepository.findOne({
			_id: convertStringIdToObjectId(id),
			host: convertStringIdToObjectId(user._id),
		});

		if (!eventExists) {
			throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
		}

		return this.eventRepository.aggregate([
			{ $match: { _id: convertStringIdToObjectId(id) } },

			{
				$lookup: {
					from: 'invitations',
					localField: '_id',
					foreignField: 'event',
					as: 'invitations',
				},
			},

			{
				$unwind: {
					path: '$invitations',
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$lookup: {
					from: 'users',
					localField: 'invitations.guest',
					foreignField: '_id',
					as: 'invitations.guest',
				},
			},

			{
				$unwind: {
					path: '$invitations.guest',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$unset: ['invitations.guest.password'],
			},
			{ $group: { _id: '$_id', invitation: { $push: '$invitations' } } },

			{
				$lookup: {
					from: 'events',
					localField: '_id',
					foreignField: '_id',
					as: 'event',
				},
			},

			{
				$unwind: { path: '$event', preserveNullAndEmptyArrays: true },
			},
			{
				$lookup: {
					from: 'locations',
					localField: 'event.location',
					foreignField: '_id',
					as: 'event.location',
				},
			},

			{
				$unwind: {
					path: '$event.location',
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$lookup: {
					from: 'users',
					localField: 'event.host',
					foreignField: '_id',
					as: 'event.host',
				},
			},

			{
				$unwind: {
					path: '$event.host',
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$addFields: {
					'event.invitations': '$invitation',
				},
			},

			{
				$replaceRoot: {
					newRoot: '$event',
				},
			},
			{
				$addFields: {
					coverImageUrl: {
						$concat: [process.env.API_URL, '/', '$coverImage'],
					},
				},
			},
		]);
	}

	async update<T extends UpdateEventDto>(
		id: string,
		updateEventDto: T,
		user: User,
	) {
		const eventExists = await this.eventRepository.findOne({
			_id: convertStringIdToObjectId(id),
			host: convertStringIdToObjectId(user._id),
		});

		if (!eventExists) {
			throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
		}

		const locationData = {
			city: updateEventDto.city,
			state: updateEventDto.state,
			zipCode: updateEventDto.zipCode,
			latitude: updateEventDto.latitude,
			longitude: updateEventDto.longitude,
		};

		await this.locationRepository.findByIdAndUpdate(
			{
				_id: convertStringIdToObjectId(eventExists.location),
			},
			{
				$set: locationData,
			},
			{ useFindAndModify: false, new: true },
		);

		return this.eventRepository.findByIdAndUpdate(
			{
				_id: convertStringIdToObjectId(id),
			},
			{
				$set: updateEventDto,
			},
			{ useFindAndModify: false, new: true },
		);
	}

	remove(id: string) {
		return this.eventRepository.findByIdAndDelete(
			convertStringIdToObjectId(id),
		);
	}
}
