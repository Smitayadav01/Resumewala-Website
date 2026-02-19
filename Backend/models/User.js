import mongoose from 'mongoose';
import { Schema } from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    mobileNumber: {
        type: Number,
        required: true,
        match: [/^[6-9]\d{9}$/, "Invalid mobile number"]
    },
   password: {
    type: String,
    required: function () {
        return !this.googleId;
    }
},
googleId: {
    type: String
},
resetPasswordToken: String,
resetPasswordExpire: Date,

}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);

})

const UserModel = mongoose.model("User", UserSchema)

export default UserModel;