import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrmModule } from '@lib/orm/orm.module';
import { JwtModule } from '@lib/jwt/jwt.module';

@Module({
	imports: [OrmModule, JwtModule],
	providers: [TokensService, JwtStrategy],
	exports: [TokensService],
})
export class TokenModule {}
