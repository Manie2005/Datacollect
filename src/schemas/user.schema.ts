import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema()
export class User extends Document{
    @Prop({required:true})
    firstname:string;

    @Prop({required:true})
    lastname:string;

    @Prop({required:true})
    email:string;
   
    @Prop({required:true})
    phonenumber:string;

    @Prop({required:true})
    address:string;

    
  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;
    
        @Prop({required:true})
    password:string;

    @Prop()
    resetPasswordToken?:string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop({ default: false }) // Default value is false
isVerified: boolean;

    @Prop()
    otpCode?:string;

    @Prop()
    otpexpires?:string;
}
export const UserSchema =SchemaFactory.createForClass(User);