const mongoose = require('mongoose');
const { RECORD_TYPE_VALUES } = require('../utils/constants');

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    type: {
      type: String,
      required: [true, 'Record type is required'],
      enum: {
        values: RECORD_TYPE_VALUES,
        message: '{VALUE} is not a valid record type. Must be income or expense',
      },
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
// Strategic indexes for the most common query patterns

recordSchema.index({ date: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ type: 1 });
recordSchema.index({ isDeleted: 1, date: -1 }); // Compound: active records by date (most common)
recordSchema.index({ isDeleted: 1, type: 1 });   // Compound: active records by type (analytics)

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
