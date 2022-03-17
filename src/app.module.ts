import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EventModule } from '@modules/event/event.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
	AcceptLanguageResolver,
	HeaderResolver,
	I18nJsonParser,
	I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';
import { join } from 'path';
import { TwilioModule } from '@lib/twilio/twilio.module';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		OrmModule,
		TwilioModule.forRootAsync(TwilioModule, {
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				accountSid: configService.get('twilio.accountSid'),
				authToken: configService.get('twilio.authToken'),
				from: configService.get('twilio.from'),
			}),
			inject: [ConfigService],
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, 'resources'),
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			parser: I18nJsonParser,
			parserOptions: {
				path: path.join(__dirname, '/resources/i18n/'),
			},
			resolvers: [
				new HeaderResolver(['x-custom-lang']),
				AcceptLanguageResolver,
			],
		}),
		UserModule,
		EventModule,
		AuthModule,
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
