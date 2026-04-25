import User from '../models/User.js';
import Review from '../models/Review.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.portfolio = req.body.portfolio !== undefined ? req.body.portfolio : user.portfolio;
      user.skills = req.body.skills || user.skills;
      user.needs = req.body.needs || user.needs;

      user.socialLinks = req.body.socialLinks || user.socialLinks;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        portfolio: updatedUser.portfolio,
        skills: updatedUser.skills,
        needs: updatedUser.needs,
        avatar: updatedUser.avatar,
        socialLinks: updatedUser.socialLinks,
        isApproved: updatedUser.isApproved,
        profileCompleted: updatedUser.profileCompleted,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Complete profile (for OAuth users)
// @route   PUT /api/users/complete-profile
// @access  Private
export const completeProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.role = req.body.role || user.role;
      user.skills = req.body.skills || user.skills;
      user.needs = req.body.needs || user.needs;
      user.portfolio = req.body.portfolio || user.portfolio;
      user.socialLinks = req.body.socialLinks || user.socialLinks;
      user.profileCompleted = true;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        portfolio: updatedUser.portfolio,
        skills: updatedUser.skills,
        needs: updatedUser.needs,
        avatar: updatedUser.avatar,
        socialLinks: updatedUser.socialLinks,
        isApproved: updatedUser.isApproved,
        profileCompleted: updatedUser.profileCompleted,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Public profile)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password').lean(); // Use lean to add properties easily

    if (user) {
      // Fetch reviews if user is a provider
      if (user.role === 'provider') {
        const reviews = await Review.find({ provider: user._id })
          .populate('artist', 'name avatar')
          .sort({ createdAt: -1 });
        user.reviews = reviews;
      }

      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers
// @route   GET /api/users/providers
// @access  Public
export const getProviders = async (req, res, next) => {
  try {
    const providers = await User.find({ role: 'provider', isApproved: true })
      .select('-password');
    res.json(providers);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // Create a URL path for the file
      user.avatar = `/${req.file.path.replace(/\\/g, '/')}`; // Ensure correct path format
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
