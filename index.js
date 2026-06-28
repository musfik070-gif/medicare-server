require("dotenv").config();

const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");


const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});
app.use((req, res, next) => {
  const normalizedPath = req.path.replace(/\/$/, "");
  const isBetterAuth =
    normalizedPath.startsWith("/api/auth") &&
    !["/api/auth/register", "/api/auth/login", "/api/auth/google"].includes(normalizedPath);

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
