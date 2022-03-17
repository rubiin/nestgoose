import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export type LocationDocument = Location & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class Location extends Document {
	@Prop({
		required: true,
	})
	latitude: string;
	@Prop({
		required: true,
	})
	longitude: string;

	@Prop({
		required: false,
	})
	state: string;

	@Prop({
		required: false,
	})
	city: string;

	@Prop({
		required: false,
	})
	zipCode: string;
}

const LocationSchema = SchemaFactory.createForClass(Location);

LocationSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

LocationSchema.pre('save', next => {
	next();
});

export { LocationSchema };
