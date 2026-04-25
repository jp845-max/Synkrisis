import User from '../models/User.js';
import Project from '../models/Project.js';
import Contract from '../models/Contract.js';
import ConsultingRequest from '../models/ConsultingRequest.js';
import { sendProviderApproved, sendProviderMatched } from '../services/emailService.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: 'active' });
    const pendingConsulting = await ConsultingRequest.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalProjects,
      activeContracts,
      pendingConsulting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a provider
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin)
export const approveProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.role === 'provider') {
      user.isApproved = true;
      await user.save();

      await sendProviderApproved(user.email);

      res.json({ message: 'Provider approved' });
    } else {
      res.status(404);
      throw new Error('Provider not found or user is not a provider');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get consulting requests
// @route   GET /api/admin/consulting
// @access  Private (Admin)
export const getConsultingRequests = async (req, res, next) => {
  try {
    const requests = await ConsultingRequest.find({})
      .populate('artist', 'name email')
      .populate('recommendedProvider', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Match provider to consulting request
// @route   PUT /api/admin/consulting/:id/match
// @access  Private (Admin)
export const matchConsultingProvider = async (req, res, next) => {
  try {
    const { providerId, notes } = req.body;
    
    const request = await ConsultingRequest.findById(req.params.id)
      .populate('artist');

    if (!request) {
      res.status(404);
      throw new Error('Consulting request not found');
    }

    const provider = await User.findById(providerId);

    if (!provider || provider.role !== 'provider') {
      res.status(404);
      throw new Error('Provider not found or invalid user');
    }

    request.recommendedProvider = provider._id;
    request.status = 'matched';
    if (notes) request.adminNotes = notes;

    // Create a new drafted project for them
    const project = await Project.create({
      title: 'Consulting Project Assignment',
      description: request.projectDescription.substring(0, 50) + '...',
      fullDescription: request.projectDescription,
      budget: request.budgetMax || request.budgetMin || 0,
      timeline: request.timeline,
      skills: request.preferredSkills,
      status: 'open',
      assignmentType: 'consulting',
      postedBy: request.artist._id,
      assignedTo: provider._id
    });

    request.resultingProject = project._id;
    await request.save();

    // Create draft contract
    const contract = await Contract.create({
      project: project._id,
      artist: request.artist._id,
      provider: provider._id,
      milestones: [
        {
          title: 'Initial Milestone',
          amount: project.budget,
        }
      ],
      totalAmount: project.budget * 1.10, // 10% fee
    });

    await sendProviderMatched(request.artist.email, project.title, provider.name, contract._id);

    res.json({ request, project, contract });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private (Admin)
export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({})
      .populate('postedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contracts
// @route   GET /api/admin/contracts
// @access  Private (Admin)
export const getAllContracts = async (req, res, next) => {
  try {
    const contracts = await Contract.find({})
      .populate('artist', 'name email')
      .populate('provider', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    next(error);
  }
};
