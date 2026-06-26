require("dotenv").config();

const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

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
