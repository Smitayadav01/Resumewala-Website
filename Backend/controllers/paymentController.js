import Razorpay from "razorpay";
import crypto from "crypto";
import Employer from "../models/Employer.js";
import Payment from "../models/Payment.js";
import { sendEmail } from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  basic:    { amount: 99900,  jobCredits: 5,     validityDays: 30, label: "Basic Plan" },
  standard: { amount: 249900, jobCredits: 15,    validityDays: 60, label: "Standard Plan" },
  premium:  { amount: 499900, jobCredits: 99999, validityDays: 90, label: "Premium Plan" },
};

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: "Invalid plan." });

    const employer = await Employer.findById(req.employer._id);
    const currentPlan = employer.subscription?.plan;
    const isExpired = employer.subscription?.expiresAt
      ? new Date() > new Date(employer.subscription.expiresAt)
      : false;

    // ✅ 4 — If same plan and not expired, block duplicate purchase
    if (currentPlan === plan && !isExpired) {
      return res.status(400).json({
        message: `You already have an active ${plan} plan. It expires on ${new Date(employer.subscription.expiresAt).toLocaleDateString("en-IN")}. Please wait for it to expire before renewing, or choose a different plan.`,
        canRenew: false,
      });
    }

    const planData = PLANS[plan];
    const order = await razorpay.orders.create({
      amount: planData.amount,
      currency: "INR",
      receipt: `order_${req.employer._id}_${Date.now()}`,
    });

    const payment = await Payment.create({
      employer: req.employer._id,
      plan,
      amount: planData.amount / 100,
      razorpayOrderId: order.id,
      jobCredits: planData.jobCredits,
      validityDays: planData.validityDays,
    });

    res.json({
      orderId: order.id,
      amount: planData.amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      planLabel: planData.label,
      paymentDbId: payment._id,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Payment initiation failed." });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDbId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentDbId,
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: "success" },
      { new: true }
    );

    const planData = PLANS[payment.plan];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + payment.validityDays);

    await Employer.findByIdAndUpdate(req.employer._id, {
      subscription: {
        plan: payment.plan,
        jobCredits: payment.jobCredits,
        expiresAt,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    const employer = await Employer.findById(req.employer._id);
    await sendEmail({
      to: employer.email,
      subject: `Payment Confirmed – ${planData.label}`,
      html: `
        <h2>Payment Successful!</h2>
        <p>Hi ${employer.recruiterName}, your <strong>${planData.label}</strong> is now active.</p>
        <ul>
          <li>Job Credits: ${payment.jobCredits === 99999 ? "Unlimited" : payment.jobCredits}</li>
          <li>Valid Until: ${expiresAt.toDateString()}</li>
        </ul>
      `,
    });

    res.json({ message: "Payment verified. Subscription activated!", subscription: employer.subscription });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ employer: req.employer._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};