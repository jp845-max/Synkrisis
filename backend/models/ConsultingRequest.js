import mongoose from 'mongoose';

const consultingRequestSchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    projectDescription: {
      type: String,
      required: true,
    },
    budgetMin: {
      type: Number,
    },
    budgetMax: {
      type: Number,
    },
    timeline: {
      type: String,
    },
    preferredSkills: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'matched', 'closed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
    recommendedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resultingProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    scheduledCall: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultingRequest = mongoose.model('ConsultingRequest', consultingRequestSchema);

export default ConsultingRequest;
