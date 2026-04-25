import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Contract from '../models/Contract.js';
import { 
  sendNewApplicationNotifyArtist, 
  sendNewApplicationNotifyAdmin,
  sendApplicationAccepted,
  sendApplicationRejected
} from '../services/emailService.js';

// @desc    Apply to a project
// @route   POST /api/projects/:id/apply
// @access  Private (Provider)
export const applyToProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('postedBy');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.status !== 'open') {
      res.status(400);
      throw new Error('Project is no longer open for applications');
    }

    const applicationExists = await Application.findOne({
      project: project._id,
      applicant: req.user._id,
    });

    if (applicationExists) {
      res.status(400);
      throw new Error('You have already applied to this project');
    }

    const { coverLetter, proposedBudget } = req.body;

    const application = await Application.create({
      project: project._id,
      applicant: req.user._id,
      coverLetter,
      proposedBudget,
    });

    // Send emails
    if (project.postedBy && project.postedBy.email) {
      await sendNewApplicationNotifyArtist(project.postedBy.email, project.title, req.user.name, application._id);
    }
    await sendNewApplicationNotifyAdmin(project.title, req.user.name);

    res.status(201).json(application);
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      res.status(400);
      next(new Error('You have already applied to this project'));
    } else {
      next(error);
    }
  }
};

// @desc    Get open applications for a project
// @route   GET /api/projects/:id/applications
// @access  Private (Artist/Owner)
export const getProjectApplications = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.postedBy.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view these applications');
    }

    const applications = await Application.find({ project: project._id })
      .populate('applicant', 'name avatar skills portfolio bio rating completedProjects')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept application
// @route   PUT /api/applications/:id/accept
// @access  Private (Artist)
export const acceptApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('project')
      .populate('applicant');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const project = application.project;

    if (project.postedBy.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to accept this application');
    }

    if (project.status !== 'open') {
      res.status(400);
      throw new Error('Project is no longer open');
    }

    // Mark application as accepted
    application.status = 'accepted';
    await application.save();

    // Mark project as in progress and assigned
    project.status = 'in_progress';
    project.assignedTo = application.applicant._id;
    await project.save();

    // Reject all other pending applications for this project
    const otherApplications = await Application.find({
      project: project._id,
      _id: { $ne: application._id },
      status: 'pending'
    }).populate('applicant');

    for (const otherApp of otherApplications) {
      otherApp.status = 'rejected';
      await otherApp.save();
      await sendApplicationRejected(otherApp.applicant.email, project.title);
    }

    // Create Draft Contract
    const contract = await Contract.create({
      project: project._id,
      artist: req.user._id,
      provider: application.applicant._id,
      milestones: [
        {
          title: 'Full Project Delivery',
          description: 'Deliver the complete project as per requirements',
          amount: application.proposedBudget || project.budget,
          duration: project.timeline || 'TBD',
        }
      ],
      totalAmount: (application.proposedBudget || project.budget) * 1.10, // includes 10% fee
      platformFeePercentage: 10,
    });

    // Notify builder
    await sendApplicationAccepted(application.applicant.email, project.title, contract._id);

    res.json({ application, contract });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject application
// @route   PUT /api/applications/:id/reject
// @access  Private (Artist)
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('project').populate('applicant');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.project.postedBy.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to reject this application');
    }

    application.status = 'rejected';
    await application.save();

    await sendApplicationRejected(application.applicant.email, application.project.title);

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (Provider)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('project', 'title budget status createdAt')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};
