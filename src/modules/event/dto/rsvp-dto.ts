import { IsOptional } from '@common/validators/custom-optional.validator';
import { IsIn, IsNotEmpty } from 'class-validator';

export class RsvpEventDto {
	@IsNotEmpty()
	@IsIn(['YES', 'NO', 'MAYBE'])
	going!: string;

	@IsOptional()
	message: string;
}
