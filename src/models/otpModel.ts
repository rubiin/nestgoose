import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export type OtpDocument = Otp & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class Otp extends Document {
	@Prop({ type: [Types.ObjectId], ref: 'User' })
	user: string;

	@Prop({ required: true })
	phoneNumber: string;

	@Prop({ required: true })
	verificationCode: string;

	@Prop({
		type: Date,
		default: new Date(Date.now() + 5 * 60 * 1000).getTime(), // current + 5 minutes
	})
	expiryDate: Date;

	@Prop({
		type: Boolean,
		default: false,
	})
	isUsed: boolean;
}

const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

OtpSchema.pre('save', next => {
	next();
});

export { OtpSchema };
