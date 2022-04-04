import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Module({
	exports: [LoggerModule],
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					pinoHttp: {
						level:
							process.env.NODE_ENV !== 'production'
								? 'debug'
								: 'info',
						transport:
							process.env.NODE_ENV !== 'production'
								? { target: 'pino-pretty' }
								: undefined,
					},
				};
			},
		}),
	],
})
export class NestPinoModule {}
