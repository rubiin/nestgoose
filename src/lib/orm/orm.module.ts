import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Otp, OtpSchema, User, UserSchema } from '@models';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGODB_URI'),
				useUnifiedTopology: true,
				useNewUrlParser: true,
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([
			{ name: Otp.name, schema: OtpSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	exports: [MongooseModule],
})
export class OrmModule {}
