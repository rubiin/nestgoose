import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EventModule } from '@modules/event/event.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { join } from 'path';
import { NestTwilioModule } from '@lib/twilio';
import { MailModule } from '@lib/mailer/mailer.module';
import { NestI18nModule } from '@lib/i18n/i18n.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		OrmModule,
		UserModule,
		EventModule,
		AuthModule,
		NestTwilioModule,
		NestI18nModule,
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
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
