import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export type EventDocument = Event & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class Event extends Document {
	@Prop({ type: [Types.ObjectId], ref: 'Host' })
	host: string;

	@Prop({ required: true, index: true })
	title: string;

	@Prop({ required: false })
	description: string;

	@Prop({ required: true })
	coverImage: string;

	@Prop({ required: true })
	eventType: string;

	@Prop({ required: true })
	eventCategory: string;

	@Prop({
		type: Date,
		required: true,
		default: Date.now,
	})
	startDateTime: Date;

	@Prop({
		type: Date,
		required: false,
		default: null,
	})
	endDateTime: Date;

	@Prop({
		required: false,
		default: null,
	})
	eventLink: string;

	@Prop({ type: [Types.ObjectId], ref: 'Location' })
	location: string;
}
const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

EventSchema.pre('save', next => {
	next();
});

export { EventSchema };
