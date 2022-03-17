import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	imports: [OrmModule],
	controllers: [EventController],
	providers: [EventService],
})
export class EventModule {}
