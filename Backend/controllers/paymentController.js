const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Employer = require('../models/Employer');
const { sendEmail } = require('../utils/sendEmail');
const { emailTemplates } = require('../utils/emailTemplates');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  basic: { name: 'Basic', amount: 99900, jobCredits: 5, validityDays: 30 },        // ₹999
  standard: { name: 'Standard', amount: 199900, jobCredits: 15, validityDays: 60 }, // ₹1999
  premium: { name: 'Premium', amount: 349900, jobCredits: 999, validityDays: 90 },  // ₹3499
};

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan.' });

    const planDetails = PLANS[plan];

    const order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: 'INR',
      receipt: `rcpt_${req.employer._id}_${Date.now()}`,
    });

    const payment = await Payment.create({
      employer: req.employer._id,
      plan,
      amount: planDetails.amount,
      razorpayOrderId: order.id,
      jobCreditsGranted: planDetails.jobCredits,
      validityDays: planDetails.validityDays,
    });

    res.json({
      success: true,
      order,
      planDetails,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

// ─── VERIFY PAYMENT ───────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan.' });
    const planDetails = PLANS[plan];

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
        paidAt: new Date(),
      },
      { new: true }
    );

    // Update employer subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planDetails.validityDays);

    const employer = await Employer.findByIdAndUpdate(
      req.employer._id,
      {
        'subscription.plan': plan,
        'subscription.jobCredits': planDetails.jobCredits,
        'subscription.expiresAt': expiresAt,
        'subscription.razorpayOrderId': razorpay_order_id,
        'subscription.razorpayPaymentId': razorpay_payment_id,
        'subscription.activatedAt': new Date(),
      },
      { new: true }
    );

    // Send confirmation email
    await sendEmail({
      to: employer.email,
      subject: `Payment Successful – ${planDetails.name} Plan Activated`,
      html: emailTemplates.paymentConfirmation(
        employer.recruiterName,
        planDetails.name,
        planDetails.amount / 100,
        expiresAt
      ),
    }).catch(console.error);

    res.json({
      success: true,
      message: `${planDetails.name} plan activated successfully!`,
      subscription: employer.subscription,
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET PAYMENT HISTORY ──────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ employer: req.employer._id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── ADMIN: ALL PAYMENTS ──────────────────────────────────────
exports.adminGetAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('employer', 'companyName email recruiterName');

    const total = await Payment.countDocuments(filter);
    res.json({ success: true, payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.PLANS = PLANS;