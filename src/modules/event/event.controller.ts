import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InviteEventDto } from './dto/invite-dto';
import { GetPaginationQuery } from '@common/classes/pagnation';

@Controller('event')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Post()
	create(@Body() createEventDto: CreateEventDto) {
		return this.eventService.create(createEventDto);
	}

	@Get()
	findAll(@Query() options: GetPaginationQuery) {
		return this.eventService.findAll(options);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.eventService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
		return this.eventService.update(+id, updateEventDto);
	}


	@Post(':id/invite')
	inviteGuests(@Param('id') id: string, @Body() inviteDto: InviteEventDto) {
		return this.eventService.inviteGuests(id, inviteDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.eventService.remove(id);
	}
}
