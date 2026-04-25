import Contract from '../models/Contract.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { calculateCommission } from '../utils/commission.js';
import {
  sendContractCreated,
  sendContractAccepted,
  sendContractFullyActive,
  sendPaymentProcessed
} from '../services/emailService.js';

// @desc    Get contract details
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project')
      .populate('artist', 'name email avatar')
      .populate('provider', 'name email avatar');

    if (!contract) {
      res.status(404);
      throw new Error('Contract not found');
    }

    if (
      contract.artist._id.toString() !== req.user._id.toString() &&
      contract.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to view this contract');
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Create contract
// @route   POST /api/contracts
// @access  Private
export const createContract = async (req, res, next) => {
  try {
    const { projectId, providerId, milestones, consultingFee = 0 } = req.body;

    const project = await Project.findById(projectId).populate('postedBy');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const totalMilestonesAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const totalAmount = totalMilestonesAmount + consultingFee;

    // Calculate tiered commission
    const { commissionRate, commissionAmount, providerPayout } = calculateCommission(totalAmount);

    const contract = await Contract.create({
      project: projectId,
      artist: project.postedBy._id,
      provider: providerId,
      milestones,
      consultingFee,
      platformFeePercentage: commissionRate,
      platformFeeAmount: commissionAmount,
      providerPayout,
      totalAmount,
    });

    // We don't have provider email populated yet, but in a real scenerio we'd fetch it.
    // Leaving out email trigger here since it's already handled in the Accept Application flow.

    res.status(201).json(contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept contract
// @route   PUT /api/contracts/:id/accept
// @access  Private
export const acceptContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project', 'title')
      .populate('artist', 'email name')
      .populate('provider', 'email name');

    if (!contract) {
      res.status(404);
      throw new Error('Contract not found');
    }

    let isArtist = false;
    let isProvider = false;

    if (contract.artist._id.toString() === req.user._id.toString()) {
      contract.artistAccepted = true;
      isArtist = true;
    } else if (contract.provider._id.toString() === req.user._id.toString()) {
      contract.providerAccepted = true;
      isProvider = true;
    } else {
      res.status(401);
      throw new Error('Not authorized to accept this contract');
    }

    await contract.save();

    // Check if fully accepted
    if (contract.artistAccepted && contract.providerAccepted) {
      if (contract.status === 'draft') {
        contract.status = 'active';
        await contract.save();
        await sendContractFullyActive([contract.artist.email, contract.provider.email, process.env.ADMIN_EMAIL], contract.project.title);
      }
    } else {
      // Notify the other party
      if (isArtist) {
        await sendContractAccepted(contract.provider.email, 'Artist', contract.project.title, contract._id);
      } else if (isProvider) {
        await sendContractAccepted(contract.artist.email, 'Provider (Builder)', contract.project.title, contract._id);
      }
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment
// @route   PUT /api/contracts/:id/pay
// @access  Private (Artist)
export const payContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project', 'title')
      .populate('provider', 'email');

    if (!contract) {
      res.status(404);
      throw new Error('Contract not found');
    }

    if (contract.artist.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to pay this contract');
    }

    contract.paymentStatus = 'paid';
    
    // Auto mark artist accepted if they pay
    if (!contract.artistAccepted) {
      contract.artistAccepted = true;
    }

    if (contract.artistAccepted && contract.providerAccepted) {
      contract.status = 'active';
    }

    await contract.save();

    await sendPaymentProcessed(contract.provider.email, contract.project.title, contract.totalAmount);

    res.json(contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's contracts
// @route   GET /api/contracts/my
// @access  Private
export const getMyContracts = async (req, res, next) => {
  try {
    let contracts = [];
    if (req.user.role === 'artist') {
      contracts = await Contract.find({ artist: req.user._id })
        .populate('project')
        .populate('provider', 'name avatar')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'provider') {
      contracts = await Contract.find({ provider: req.user._id })
        .populate('project')
        .populate('artist', 'name avatar')
        .sort({ createdAt: -1 });
    }

    res.json(contracts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get contract by Project ID
// @route   GET /api/projects/:id/contract
// @access  Private
export const getContractByProjectId = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({ project: req.params.id })
      .populate('project')
      .populate('artist', 'name email avatar')
      .populate('provider', 'name email avatar');

    if (!contract) {
      res.status(404);
      throw new Error('Contract not found for this project');
    }

    if (
      contract.artist._id.toString() !== req.user._id.toString() &&
      contract.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to view this contract');
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete contract
// @route   PUT /api/contracts/:id/complete
// @access  Private (Artist)
export const completeContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project');

    if (!contract) {
      res.status(404);
      throw new Error('Contract not found');
    }

    if (contract.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to complete this contract');
    }

    if (contract.status !== 'active') {
      res.status(400);
      throw new Error('Contract must be active in order to complete it');
    }

    contract.status = 'completed';
    await contract.save();

    const project = await Project.findById(contract.project._id);
    if (project) {
      project.status = 'completed';
      await project.save();
    }

    // Process review if provided
    const { rating, comment } = req.body;
    if (rating && comment) {
      const review = await Review.create({
        contract: contract._id,
        provider: contract.provider,
        artist: contract.artist,
        rating: Number(rating),
        comment
      });

      // Update provider stats
      const provider = await User.findById(contract.provider);
      if (provider) {
        const newReviewCount = (provider.reviewCount || 0) + 1;
        const currentRatingTotal = (provider.rating || 0) * (provider.reviewCount || 0);
        const newRating = (currentRatingTotal + Number(rating)) / newReviewCount;
        
        provider.rating = newRating;
        provider.reviewCount = newReviewCount;
        provider.completedProjects = (provider.completedProjects || 0) + 1;
        
        await provider.save();
      }
    } else {
      // Just increment completed projects if no review given
      const provider = await User.findById(contract.provider);
      if (provider) {
        provider.completedProjects = (provider.completedProjects || 0) + 1;
        await provider.save();
      }
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
};
