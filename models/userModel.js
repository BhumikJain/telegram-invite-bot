
// import { string } from"mathjs"
import mongoose from "mongoose";

// Mongoose schema for users (using String for consistency)
const UserSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: String,
  name: String,
  referredBy: { type: Number, default: null },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  lastInteraction: { type: Date, default: Date.now },
});

// Mongoose model for users
const User = mongoose.model("User", UserSchema);

export default User;
// module.exports=User;
// import mongoose from "mongoose"

// // Mongoose schema for users
// const UserSchema = new mongoose.Schema({
//   userId: { type: Number, required: true },
//   username: String,
//   name: string,
//   referredBy: { type: Number, default: null },
//   active: { type: Boolean, default: true },
//   deleted: { type: Boolean, default: false },
//   lastInteraction: { type: Date, default: Date.now },
// });

// // Mongoose model for users
// const User = mongoose.model("User", UserSchema);

// export default User;