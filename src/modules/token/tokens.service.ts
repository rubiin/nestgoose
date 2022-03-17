import { User } from '@models';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../../models/userModel';

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}

/**
 *
 *
 * @export
 * @class TokensService
 */
@Injectable()
export class TokensService {
	private readonly jwt: JwtService;
	private readonly BASE_OPTIONS: JwtSignOptions = {
		issuer: 'some-app',
		audience: 'some-app',
	};

	/**
	 * Creates an instance of TokensService.
	 * @param {RefreshTokensRepository} tokens
	 * @param {JwtService} jwt
	 * @param {EntityRepository<User>} userRepository
	 * @memberof TokensService
	 */
	constructor(
		jwt: JwtService,
		@InjectModel(User.name) private userRepository: Model<UserDocument>,
	) {
		this.jwt = jwt;
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @return {*}  {Promise<string>}
	 * @memberof TokensService
	 */
	async generateAccessToken(payload: Record<string, any>): Promise<string> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			subject: String(payload._id),
		};

		return this.jwt.signAsync({ payload }, options);
	}
}
