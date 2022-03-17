import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import * as mongooseDelete from 'mongoose-delete';
const saltRounds = 10;

export type UserDocument = User & Document;

@Schema({
	timestamps: true,
	toObject: { getters: true },
	toJSON: { getters: true },
})
export class User extends Document {
	@Prop({ required: true, index: true })
	fullName: string;

	@Prop({ required: false, default: null })
	profilePic: string;

	@Prop({ required: true })
	password: string;

	@Prop({ required: false, default: null })
	email: string;

	@Prop({ required: false, default: null })
	address: string;

	@Prop({ required: true })
	phoneNumber: string;

	@Prop({ required: false, default: false })
	isVerified: boolean;

	@Prop({ required: false, default: false })
	isRegistrationComplete: boolean;

	comparePassword: Function;
}
const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	if (this.password !== undefined) {
		this.password = bcrypt.hashSync(this.password, saltRounds);
	}

	next();
});

UserSchema.virtual('profilePicUrl').get(function () {
	return `${process.env.APP_URL}/${this.profilePic}`;
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.plugin(mongooseDelete, {
	overrideMethods: 'all',
	deletedAt: true,
});

UserSchema.plugin(mongooseAggregatePaginate);

export { UserSchema };
