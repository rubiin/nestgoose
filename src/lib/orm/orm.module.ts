import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
	Event,
	EventSchema,
	Host,
	HostSchema,
	Invitation,
	InvitationSchema,
	Location,
	Otp,
	OtpSchema,
	User,
	UserSchema,
	LocationSchema,
} from '@models';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('database.uri'),
				useUnifiedTopology: true,
				useNewUrlParser: true,
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([
			{ name: Otp.name, schema: OtpSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Location.name, schema: LocationSchema },
			{ name: Event.name, schema: EventSchema },
			{ name: Host.name, schema: HostSchema },
			{ name: Invitation.name, schema: InvitationSchema },
		]),
	],
	exports: [MongooseModule],
})
export class OrmModule {}
