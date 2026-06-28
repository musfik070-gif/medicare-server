const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const connectDB = require("./config/db");

// Retrieve MongoClient instance and the db object
const client = connectDB.client;
const db = client.db("medicareDB");

const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client,
    collectionNames: {
      // Map Better Auth 'user' to the existing 'users' collection to maintain unified user records
      user: "users",
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Set baseURL for callback redirect URL generation
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5001",
  basePath: "/api/auth",
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
});

module.exports = { auth };
