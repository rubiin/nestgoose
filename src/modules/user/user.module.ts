import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	imports: [OrmModule],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
