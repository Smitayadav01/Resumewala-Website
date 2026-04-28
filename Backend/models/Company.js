import mongoose, { Schema } from "mongoose";

const CompanySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        unique:true,
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    websiteURL:{
        type:String,       
    },
    location:{
        type:String
    },
    description:{
        type:String
    },
    status:{type: String,
        enum: [ "pending", "approved", rejected],
        default: "pending"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

},{timestamps:true})

const CompanyModel = mongoose.model("Company",CompanySchema)

export default CompanyModel;