import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { GetPaginationQuery } from '@common/classes/pagnation';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { User } from '@models';
import { ImageMulterOption } from '@common/misc/misc';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Get()
	findAll(@Query() queryDto: GetPaginationQuery) {
		return this.userService.findAll(queryDto);
	}

	@Get('profile')
	findOne(@LoggedInUser() user: User) {
		return this.userService.findOne(user._id);
	}

	@UseInterceptors(FileInterceptor('profilePic', ImageMulterOption))
	@Patch()
	update(
		@LoggedInUser() user: User,
		@Body() updateUserDto: UpdateUserDto,
		@UploadedFile() image: Express.Multer.File,
	) {
		return this.userService.update(user._id, {
			...updateUserDto,
			profilePic: image.filename,
		});
	}
}
