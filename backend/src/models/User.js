const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'health_worker', 'viewer'],
      default: 'health_worker'
    },
    department: {
      type: String,
      default: 'Primary Healthcare Operations',
      trim: true
    },
    facility: {
      type: String,
      default: 'Sehore District PHC Network',
      trim: true
    },
    phoneNumber: {
      type: String,
      default: '+91 98765 43210',
      trim: true
    },
    dutyStatus: {
      type: String,
      enum: ['on_duty', 'off_duty'],
      default: 'on_duty'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || 'healthchain_jwt_secret_dev_key_2026_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name
    },
    secret,
    { expiresIn }
  );
};

module.exports = mongoose.model('User', UserSchema);
