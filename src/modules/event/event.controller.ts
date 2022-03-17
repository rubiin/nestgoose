import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InviteEventDto } from './dto/invite-dto';
import { GetPaginationQuery } from '@common/classes/pagnation';
import { User } from '@models';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { ImageMulterOption } from '@common/misc/misc';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@UseInterceptors(FileInterceptor('coverImage', ImageMulterOption))
	@Post()
	create(
		@Body() createEventDto: CreateEventDto,
		@LoggedInUser() user: User,
		@UploadedFile() image: Express.Multer.File,
	) {
		return this.eventService.create(
			{ ...createEventDto, coverImage: image.filename },
			user,
		);
	}

	@Get()
	findAll(@Query() options: GetPaginationQuery) {
		return this.eventService.findAll(options);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @LoggedInUser() user: User) {
		return this.eventService.findOne(id, user);
	}

	@UseInterceptors(FileInterceptor('coverImage', ImageMulterOption))
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateEventDto: UpdateEventDto,
		@LoggedInUser() user: User,
		@UploadedFile() image: Express.Multer.File,
	) {
		return this.eventService.update(
			id,
			{ ...updateEventDto, coverImage: image.filename },
			user,
		);
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
