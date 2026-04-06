const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_VALUES, STATUS_VALUES, ROLES, USER_STATUS } = require('../utils/constants');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Excluded from queries by default
    },

    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: '{VALUE} is not a valid role',
      },
      default: ROLES.VIEWER,
    },

    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: '{VALUE} is not a valid status',
      },
      default: USER_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Remove sensitive fields when converting to JSON
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hooks

/**
 * Hash password before saving, but only when the password
 * field has been modified (avoids re-hashing on profile updates).
 */
userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  return next();
});

// Instance Methods

/**
 * Compare a candidate password against the stored hash.
 * @param {string} candidatePassword - Plain-text password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if the user account is active.
 * @returns {boolean}
 */
userSchema.methods.isActive = function isActive() {
  return this.status === USER_STATUS.ACTIVE;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
