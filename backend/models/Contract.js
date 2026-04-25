import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Project',
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        amount: { type: Number, required: true },
        duration: { type: String },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      },
    ],
    platformFeePercentage: {
      type: Number,
      default: 10,
    },
    platformFeeAmount: {
      type: Number,
      default: 0,
    },
    providerPayout: {
      type: Number,
      default: 0,
    },
    consultingFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    artistAccepted: {
      type: Boolean,
      default: false,
    },
    providerAccepted: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'released'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
