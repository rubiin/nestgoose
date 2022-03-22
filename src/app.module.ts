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
import { NestTwilioModule } from '@lib/twilio';
import { MailModule } from '@lib/mailer/mailer.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		OrmModule,
		UserModule,
		EventModule,
		AuthModule,
		NestTwilioModule,
		MailModule.forRoot(MailModule, {
			host: '',
			port: 465,
			username: '',
			password: '',
			previewEmail: false,
			template: {
				dir: path.join(__dirname, '/resources/templates/'),

				etaOptions: {
					cache: true,
				},
			},
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, 'resources'),
			serveStaticOptions: {
				maxAge: 86400, // 1 day
			},
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
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
