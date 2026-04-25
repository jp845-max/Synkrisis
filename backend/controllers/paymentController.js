import Razorpay from 'razorpay';
import crypto from 'crypto';
import Contract from '../models/Contract.js';
import { calculateCommission } from '../utils/commission.js';

// Lazy-initialize Razorpay to avoid crash if keys are not set
let razorpay;
const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in env vars.');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// @desc    Create Razorpay Order for Contract
// @route   POST /api/payments/create-order
// @access  Private (Artist)
export const createOrder = async (req, res) => {
  try {
    const { contractId } = req.body;

    const contract = await Contract.findById(contractId).populate('project');

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this contract' });
    }

    // Amount should be in paise for Razorpay
    const amountInPaise = Math.round(contract.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_contract_${contract._id}`,
    };

    const order = await getRazorpay().orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    // Save order details to contract
    contract.razorpayOrderId = order.id;
    
    // Auto-calculate commission if not already set or out of sync
    const { commissionRate, commissionAmount, providerPayout } = calculateCommission(contract.totalAmount);
    contract.platformFeePercentage = commissionRate;
    contract.platformFeeAmount = commissionAmount;
    contract.providerPayout = providerPayout;

    await contract.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Signature is valid
      const contract = await Contract.findById(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      contract.paymentStatus = 'paid';
      contract.status = 'active';
      contract.razorpayPaymentId = razorpay_payment_id;
      contract.razorpaySignature = razorpay_signature;

      await contract.save();

      return res.status(200).json({ message: 'Payment verified successfully', contract });
    } else {
      return res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Release Payment to Provider (Admin or automatic on complete)
// @route   POST /api/payments/release
// @access  Private (Admin or system)
export const releasePayment = async (req, res) => {
  try {
    const { contractId } = req.body;

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment is not in escrow/paid state' });
    }

    // Here you would integrate Razorpay Route to transfer funds
    // to the provider's connected account.
    // For now, we simply mark it as released in DB.

    contract.paymentStatus = 'released';
    await contract.save();

    res.status(200).json({ message: 'Payment released successfully', contract });
  } catch (error) {
    console.error('Error in releasePayment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
