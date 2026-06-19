const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// =====================
// User Schema
// =====================
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      trim:     true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // Never return password in queries
    },

    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    avatar: {
      type:    String,
      default: '/images/default-avatar.png',
    },

    isVerified: {
      type:    Boolean,
      default: false,
    },

    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// =====================
// Hash Password Before Saving
// =====================
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const saltRounds = 12;
  this.password    = await bcrypt.hash(this.password, saltRounds);
});
// =====================
// Compare Password Method
// =====================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;