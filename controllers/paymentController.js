const { ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const getAppointmentsCollection = require("../collections/appointmentsCollection");
const getPaymentsCollection = require("../collections/paymentsCollection");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";

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
    const { price, amount } = req.body;
    const paymentAmount = Number(price ?? amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid payment amount is required." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment Intent Failed" });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId, price } = req.body;
    const patientEmail = req.user?.email;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required." });
    }

    const appointmentsCollection = await getAppointmentsCollection();
    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(appointmentId),
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    }

    if (appointment.patientEmail && appointment.patientEmail !== patientEmail) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden payment request." });
    }

    const paymentAmount = Number(appointment.fee || price);
    if (!paymentAmount || paymentAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid payment amount is required." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with ${appointment.doctorName || "Doctor"}`,
            },
            unit_amount: Math.round(paymentAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId,
        patientEmail: patientEmail || "",
        patientName: appointment.patientName || "",
        doctorId: appointment.doctorId || "",
        doctorName: appointment.doctorName || "",
      },
      success_url: `${SERVER_URL}/api/payments/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/dashboard/patient/appointments`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create checkout session." });
  }
};

const savePayment = async (req, res) => {
  try {
    const payment = req.body;
    const patientEmail = req.user?.email;

    if (!payment.appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required." });
    }

    const newPayment = {
      ...payment,
      patientEmail: payment.patientEmail || patientEmail,
      amount: payment.amount || payment.price || payment.fee,
      status: "Paid",
      createdAt: new Date(),
    };

    const paymentsCollection = await getPaymentsCollection();
    const paymentResult = await paymentsCollection.insertOne(newPayment);

    const appointmentsCollection = await getAppointmentsCollection();
    const updateResult = await appointmentsCollection.updateOne(
      { _id: new ObjectId(payment.appointmentId) },
      {
        $set: {
          status: "Paid",
          appointmentStatus: "Paid",
          transactionId: payment.transactionId,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Payment successful!",
      paymentResult,
      updateResult,
    });
  } catch (error) {
    console.error("Save Payment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save payment" });
  }
};

const handleCheckoutSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.redirect(`${CLIENT_URL}/dashboard/patient/appointments`);
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.redirect(`${CLIENT_URL}/dashboard/patient/appointments`);
    }

    const appointmentId = session.metadata?.appointmentId;
    if (!appointmentId) {
      return res.redirect(`${CLIENT_URL}/dashboard/patient/appointments`);
    }

    const paymentsCollection = await getPaymentsCollection();
    const existingPayment = await paymentsCollection.findOne({
      transactionId: session.payment_intent,
    });

    if (!existingPayment) {
      await paymentsCollection.insertOne({
        appointmentId,
        transactionId: session.payment_intent,
        patientEmail: session.metadata?.patientEmail,
        patientName: session.metadata?.patientName,
        doctorId: session.metadata?.doctorId,
        doctorName: session.metadata?.doctorName,
        amount: session.amount_total / 100,
        status: "Paid",
        paymentProvider: "stripe",
        checkoutSessionId: session.id,
        createdAt: new Date(),
      });
    }

    const appointmentsCollection = await getAppointmentsCollection();
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      {
        $set: {
          status: "Paid",
          appointmentStatus: "Paid",
          transactionId: session.payment_intent,
        },
      },
    );

    res.redirect(`${CLIENT_URL}/dashboard/patient/appointments?payment=success`);
  } catch (error) {
    console.error("Stripe Checkout Success Error:", error);
    res.redirect(`${CLIENT_URL}/dashboard/patient/appointments?payment=failed`);
  }
};

// Patient: Process a payment for an approved appointment
const processPayment = savePayment;

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
  createCheckoutSession,
  savePayment,
  handleCheckoutSuccess,
  processPayment,
  getPatientPayments,
};
