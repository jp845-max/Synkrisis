import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fullDescription: {
      type: String,
    },
    budget: {
      type: Number,
      required: true,
    },
    timeline: {
      type: String,
    },
    skills: [{ type: String }],
    deliverables: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    assignmentType: {
      type: String,
      enum: ['public', 'consulting'],
      default: 'public',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
