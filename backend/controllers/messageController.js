import Message from '../models/Message.js';
import Contract from '../models/Contract.js';

// @desc    Get messages for a contract
// @route   GET /api/contracts/:contractId/messages
// @access  Private (Contract parties only)
export const getMessages = async (req, res) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify user is a party to the contract
    if (
      contract.artist.toString() !== req.user._id.toString() &&
      contract.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ contract: contractId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/contracts/:contractId/messages
// @access  Private (Contract parties only)
export const sendMessage = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify user is a party to the contract
    if (
      contract.artist.toString() !== req.user._id.toString() &&
      contract.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to send messages' });
    }

    const message = await Message.create({
      contract: contractId,
      sender: req.user._id,
      content,
      readBy: [req.user._id] // Sender automatically read it
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar role');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read for a contract
// @route   PUT /api/contracts/:contractId/messages/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    await Message.updateMany(
      { 
        contract: contractId,
        readBy: { $ne: req.user._id } 
      },
      { 
        $addToSet: { readBy: req.user._id } 
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread messages count for the user
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    // Find all active/completed contracts where user is a party
    const userContracts = await Contract.find({
      $or: [{ artist: req.user._id }, { provider: req.user._id }],
      status: { $in: ['active', 'completed'] }
    }).select('_id');

    const contractIds = userContracts.map(c => c._id);

    // Count messages in those contracts where user hasn't read them
    const unreadCount = await Message.countDocuments({
      contract: { $in: contractIds },
      readBy: { $ne: req.user._id }
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
