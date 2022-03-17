import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export type HostDocument = Host & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class Host extends Document {
	@Prop({
		required: true,
	})
	fullName: string;
	@Prop({
		required: true,
	})
	phoneNumber: string;

	@Prop({
		required: true,
	})
	address: string;
}
const HostSchema = SchemaFactory.createForClass(Host);

HostSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

HostSchema.pre('save', next => {
	next();
});

export { HostSchema };
