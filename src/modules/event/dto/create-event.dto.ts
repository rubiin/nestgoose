import { IsOptional } from '@common/validators/custom-optional.validator';
import { IsNotEmpty } from 'class-validator';

export class CreateEventDto {
	@IsNotEmpty()
	title!: string;

	@IsNotEmpty()
	description!: string;

	@IsNotEmpty()
	startDateTime!: string;

	@IsOptional()
	endDateTime: string;

	@IsOptional()
	eventLink: string;

	@IsNotEmpty()
	eventType!: string;

	@IsNotEmpty()
	eventCategory!: string;

	@IsNotEmpty()
	latitude!: string;

	@IsNotEmpty()
	longitude!: string;

	@IsOptional()
	zipCode: string;

	@IsOptional()
	state: string;

	@IsOptional()
	city: string;
}
