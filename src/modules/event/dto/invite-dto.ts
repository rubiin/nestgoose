import { IsArray, Matches } from 'class-validator';

export class InviteEventDto {
	@IsArray()
	@Matches(/^9(7|8)\d{8}$/, {
		each: true,
		message: 'Phone number must be 10 digits long and start with 98 or 97',
	})
	phoneNumbers!: string[];
}
