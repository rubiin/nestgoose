import { Global, Module } from '@nestjs/common';
import {
	ConfigModule as NestJsConfigModule,
	ConfigService,
} from '@nestjs/config';
import { app, database, jwt, twilio } from './configs';
import { validationSchema } from './validate.config';

@Global()
@Module({
	imports: [
		NestJsConfigModule.forRoot({
			envFilePath: ['env/.env.dev'],
			load: [app, jwt, database, twilio],
			cache: true,
			isGlobal: true,
			expandVariables: true,
			validationSchema: validationSchema,
			validationOptions: {
				abortEarly: true,
			},
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class ConfigModule {}
