const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const {isEmail} = require('validator')

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, validate: isEmail, unique: true, require: true },
  password: { type: String, unique: true },
  confirmPassword: {type: String, require: true},
  newMessage: {type: Object, default:{}},
  status: {type: String, default:'online'}
});

userSchema.pre('save', async function (next){
  try {
    if (!this.isModified('password')){
      return next();
    }
    // Ensure that confirm password and password are same
    if (this.password != this.confirmPassword){
      throw new Error("Password and confirm password do not match.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    this.confirmPassword = hashedPassword;
    return next();
  } catch (error){
    return next(error)
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
