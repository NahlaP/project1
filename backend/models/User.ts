// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// export default mongoose.model('User', userSchema);



import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: false, default: "" },
    email:    { type: String, required: false, default: "" },
    password: { type: String, required: false, default: "" },
    selectedTemplateId: { type: String, default: null }, // ← NEW
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
