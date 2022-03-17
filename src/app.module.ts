import { LoggingInterceptor } from '@common/interceptors/logger.interceptor';
import { ConfigModule } from '@lib/config/config.module';
import { OrmModule } from '@lib/orm/orm.module';
import { AuthModule } from '@modules/auth/auth.module';
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
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		OrmModule,
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
	],
	providers: [
		{
			useClass: LoggingInterceptor,
			provide: APP_INTERCEPTOR,
		},
	],
})
export class AppModule {}
