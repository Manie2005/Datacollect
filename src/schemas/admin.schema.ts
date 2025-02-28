import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Admin extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'admin' })  // Ensure role is always set to 'admin'
  role: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
