import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PrimaryGeneratedColumn } from "typeorm";
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

    @Prop({ default: false }) // Default value is false
isBlocked: boolean;

    @Prop()
    otpexpires?:string;


  // ✅ Add this field to fix refresh token issue
  @Prop({ default: null })
  refreshToken?: string;
}
export const UserSchema =SchemaFactory.createForClass(User);