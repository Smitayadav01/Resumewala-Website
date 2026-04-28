import mongoose, { Schema } from "mongoose";

const EmployerSchema = new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company"},
    designation: String,
    role: {
        type: String,
        enum: [ "admin", "member"],
        default: "member"
    },
    
}, { timestamps: true });

const EmployerModel = mongoose.model("Employer", EmployerSchema);

export default EmployerModel;