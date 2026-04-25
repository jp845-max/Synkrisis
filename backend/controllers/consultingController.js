import ConsultingRequest from '../models/ConsultingRequest.js';
import { 
  sendConsultingRequestNotifyAdmin,
  sendScheduleCallNotifyAdmin
} from '../services/emailService.js';

// @desc    Submit consulting request
// @route   POST /api/consulting
// @access  Private (Artist)
export const submitConsultingRequest = async (req, res, next) => {
  try {
    const { projectDescription, budgetMin, budgetMax, timeline, preferredSkills } = req.body;

    const request = await ConsultingRequest.create({
      artist: req.user._id,
      projectDescription,
      budgetMin,
      budgetMax,
      timeline,
      preferredSkills,
    });

    // Notify admin
    await sendConsultingRequestNotifyAdmin(
      req.user.name, 
      projectDescription, 
      `${budgetMin}-${budgetMax}`, 
      preferredSkills.join(', ')
    );

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's consulting requests
// @route   GET /api/consulting/my
// @access  Private
export const getMyConsultingRequests = async (req, res, next) => {
  try {
    let requests = [];
    if (req.user.role === 'artist') {
      requests = await ConsultingRequest.find({ artist: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'provider') {
      requests = await ConsultingRequest.find({ recommendedProvider: req.user._id }).sort({ createdAt: -1 });
    }
    
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consulting request
// @route   GET /api/consulting/:id
// @access  Private
export const getConsultingRequestById = async (req, res, next) => {
  try {
    const request = await ConsultingRequest.findById(req.params.id)
      .populate('artist', 'name email')
      .populate('recommendedProvider', 'name email avatar skills portfolio bio rating')
      .populate('resultingProject');

    if (request) {
      res.json(request);
    } else {
      res.status(404);
      throw new Error('Consulting request not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a call for consulting request
// @route   POST /api/consulting/:id/schedule-call
// @access  Private (Artist)
export const scheduleCall = async (req, res, next) => {
  try {
    const request = await ConsultingRequest.findById(req.params.id);

    if (request) {
      if (request.artist.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized for this request');
      }

      request.scheduledCall = true;
      await request.save();

      // Notify admin
      await sendScheduleCallNotifyAdmin(req.user.name, req.user.email);

      res.json({ message: 'Call scheduling noted, admin notified' });
    } else {
      res.status(404);
      throw new Error('Consulting request not found');
    }
  } catch (error) {
    next(error);
  }
};
