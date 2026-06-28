const { ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const getAppointmentsCollection = require("../collections/appointmentsCollection");
const getPaymentsCollection = require("../collections/paymentsCollection");

// Admin: Get ALL payments across the platform
const getAllPaymentsAdmin = async (req, res) => {
  try {
    const paymentsCollection = await getPaymentsCollection();

    // Sort by most recent payment first
    const payments = await paymentsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Admin Fetch Payments Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment records" });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid payment amount is required." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create payment intent." });
  }
};

// Patient: Process a payment for an approved appointment
const processPayment = async (req, res) => {
  try {
    const { appointmentId, doctorId, doctorName, fee } = req.body;
    const patientEmail = req.user.email;

    const transactionId = "txn_" + Math.random().toString(36).substring(2, 15);

    const newPayment = {
      appointmentId,
      transactionId,
      patientEmail,
      patientName: req.body.patientName,
      doctorId,
      doctorName,
      amount: fee,
      status: "Paid",
      createdAt: new Date(),
    };

    const paymentsCollection = await getPaymentsCollection();
    await paymentsCollection.insertOne(newPayment);

    const appointmentsCollection = await getAppointmentsCollection();
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { status: "Paid", transactionId: transactionId } },
    );

    res.status(200).json({
      success: true,
      message: "Payment successful!",
      transactionId,
    });
  } catch (error) {
    console.error("Payment Processing Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment failed to process." });
  }
};

// Patient: Get own payment history
const getPatientPayments = async (req, res) => {
  try {
    const patientEmail = req.user.email;
    const paymentsCollection = await getPaymentsCollection();

    const payments = await paymentsCollection
      .find({ patientEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Patient Fetch Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history.",
    });
  }
};

module.exports = {
  getAllPaymentsAdmin,
  createPaymentIntent,
  processPayment,
  getPatientPayments,
};
