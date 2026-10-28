import mongoose from 'mongoose';
import crypto from 'crypto';

const InquirySchema = new mongoose.Schema(
  {
    inquiryNumber: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      default: 'General Inquiries',
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: String,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

InquirySchema.pre('save', function (next) {
  if (!this.inquiryNumber) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.inquiryNumber = `INQ-2026-${randomHex}`;
  }
  next();
});

export default mongoose.model('Inquiry', InquirySchema);
