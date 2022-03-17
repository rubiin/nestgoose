import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export type InvitationDocument = Invitation & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class Invitation extends Document {
	@Prop({ type: [Types.ObjectId], ref: 'Event' })
	event: string;
	@Prop({ type: [Types.ObjectId], ref: 'User' })
	guest: string;

	@Prop({ required: true, index: true })
	title: string;

	@Prop({ required: false })
	description: string;

	@Prop({ required: true })
	coverImage: string;

	@Prop({ required: true })
	eventType: string;

	@Prop({
		required: false,
		enum: ['YES', 'NO', 'MAYBE', null],
		default: null,
	})
	going: string;

	@Prop({
		required: false,
		default: null,
	})
	message: string;

	@Prop({
		type: Date,
		required: false,
		default: null,
	})
	endDateTime: Date;

	@Prop({
		type: Boolean,
		required: false,
		default: false,
	})
	isRsvped: boolean;
}
const InvitationSchema = SchemaFactory.createForClass(Invitation);

InvitationSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

InvitationSchema.pre('save', next => {
	next();
});

export { InvitationSchema };
