require("dotenv").config();

const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
app.set("trust proxy", 1);
app.enable("trust proxy");

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "https://medicare-client-gamma.vercel.app",
      "http://localhost:3000"
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"]
}));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});
app.use((req, res, next) => {
  const normalizedPath = req.path.replace(/\/$/, "");
  const isBetterAuth =
    normalizedPath.startsWith("/api/auth") &&
    !["/api/auth/register", "/api/auth/login", "/api/auth/google"].includes(
      normalizedPath,
    );

  if (isBetterAuth) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/health", healthRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5001;

app.get("/ping", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("🚀 MediCare Server Running");
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
