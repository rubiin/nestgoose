import * as eta from 'eta';
import * as sharp from 'sharp';
import { slugify } from '@rubiin/js-utils';
import { customAlphabet } from 'nanoid/async';
import { randomTypes } from '@common/constants/random-types.enum';
import { IAuthenticationPayload } from '@common/interfaces/authentication.interface';

export /** @type {*} */
/** @type {*} */
/** @type {*} */
const HelperService = {
	/**
	 *
	 *
	 * @param {*} op
	 * @param {...any[]} args
	 * @return {*}  {*}
	 */
	makeTask: (op: any, ...args: any[]): any => {
		return { op, args };
	},

	/**
	 *
	 *
	 * @param {Record<string,any>} obj
	 * @return {*}
	 */
	dispatcher: (obj: Record<string, any>) => {
		return async ({ op, args }) => {
			return await obj[op](...args);
		};
	},

	/**
	 * builds response for login
	 *
	 * @static
	 * @param {User} user
	 * @param {string} accessToken
	 * @return {AuthenticationPayload}
	 * @memberof UtilService
	 */
	buildPayloadResponse: (
		user: Record<string, any>,
		accessToken: string,
	): IAuthenticationPayload => {
		return {
			user,
			payload: {
				access_token: accessToken,
			},
		};
	},

	/**
	 * renders template file with eta
	 * @static
	 * @param {unknown} data
	 * @param {string} path
	 * @return {*}  {(Promise<string | void>)}
	 * @memberof HelperService
	 */
	renderTemplate: (data: unknown, path: string): void | Promise<string> => {
		return eta.renderFileAsync(
			path,
			{ data },
			{ cache: true, rmWhitespace: true },
		);
	},

	/**
	 *
	 *
	 * @static
	 * @param {Buffer} input
	 * @param {{height: number, width: number}} config
	 * @return {*}  {Promise<Buffer>}
	 * @memberof HelperService
	 */
	generateThumb: (
		input: Buffer,
		config: { height: number; width: number },
	): Promise<Buffer> => {
		return sharp(input).resize(config).toFormat('png').toBuffer();
	},
	/**
	 *
	 *
	 * @static
	 * @param {randomTypes} type
	 * @param {number} length
	 * @param {string} [alphabet]
	 * @return {*}  {(Promise<number | string>)}
	 * @memberof HelperService
	 */
	getRandom: (
		type: randomTypes,
		length: number,
		alphabet?: string,
	): Promise<number | string> => {
		if (alphabet) {
			return customAlphabet(alphabet, length)();
		}

		return customAlphabet(
			type === randomTypes.NUMBER
				? '1234567890'
				: // eslint-disable-next-line no-secrets/no-secrets
				  'abcdefghijklmnopqrstuvwxyz',
			length,
		)();
	},

	enumToString: (value: Record<string, any>): string[] => {
		const length = Object.keys(value).length;

		return Object.keys(value).splice(length / 2, length);
	},

	generateSlug: (value: string): string => {
		return slugify(value);
	},
};
