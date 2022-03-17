import { User } from '@models';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { UserDocument } from 'models/userModel';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { convertStringIdToObjectId } from '@common/misc/misc';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectModel(User.name)
		private readonly usersRepo: Model<UserDocument>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
			ignoreExpiration: false,
		});
	}

	async validate(payload: any, done: (arg0: any, arg1: User) => void) {
		const { user: _idx } = payload;
		const user = await this.usersRepo.findOne({
			_id: convertStringIdToObjectId(_idx),
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		done(null, user);
	}
}
