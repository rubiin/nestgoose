import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { FIREBASE_ADMIN_OPTIONS } from './firebase-admin.constant'; // the constant string/symbol/token
import { FirebaseAdminOptions } from './firebase-admin.options'; // the options to provide to the service
import { FirebaseAdminService } from './firebase-admin.service'; // the service to be provided to the rest of the server

@Module({
	providers: [FirebaseAdminService],
	exports: [FirebaseAdminService],
})
export class FirebaseAdminModule extends createConfigurableDynamicRootModule<
	FirebaseAdminModule,
	FirebaseAdminOptions
>(FIREBASE_ADMIN_OPTIONS) {
	static Deferred = FirebaseAdminModule.externallyConfigured(
		FirebaseAdminModule,
		0,
	);
}
