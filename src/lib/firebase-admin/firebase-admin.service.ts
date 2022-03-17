import { Inject, Injectable } from '@nestjs/common';
import { FIREBASE_ADMIN_OPTIONS } from './firebase-admin.constant';
import { FirebaseAdminOptions } from './firebase-admin.options';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
	private admin: any;
	constructor(
		@Inject(FIREBASE_ADMIN_OPTIONS)
		private readonly options: FirebaseAdminOptions,
	) {
		this.admin = admin.initializeApp({
			credential: admin.credential.cert(this.options.credentialPath),
			databaseURL: this.options.databaseUrl,
		});
	}
}
