import { IResponse } from '@common/interfaces/response.interface';
import { User } from '@models';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { pick } from '@rubiin/js-utils';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserDocument } from 'models/userModel';
import { Model } from 'mongoose';

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
		this.tokens = tokens;
		this.jwt = jwt;
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @return {*}  {Promise<string>}
	 * @memberof TokensService
	 */
	async generateAccessToken(user: User): Promise<string> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			subject: String(user.id),
		};

		return this.jwt.signAsync({ ...pick(user, ['id']) }, options);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {number} expiresIn
	 * @return {*}  {Promise<string>}
	 * @memberof TokensService
	 */
	async generateRefreshToken(user: User, expiresIn: number): Promise<string> {
		const token = await this.tokens.createRefreshToken(user, expiresIn);

		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			expiresIn,
			subject: String(user.id),
			jwtid: String(token.id),
		};

		return this.jwt.signAsync({}, options);
	}
}
