const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const connectDB = require("./config/db");

// Retrieve MongoClient instance and the db object
const client = connectDB.client;
const db = client.db("medicareDB");

const SERVER_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.SERVER_URL ||
  "http://localhost:5001";
const CLIENT_URL =
  process.env.CLIENT_URL || "https://medicare-client-gamma.vercel.app";

const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client,
    collectionNames: {
      // Map Better Auth 'user' to the existing 'users' collection to maintain unified user records
      user: "users",
    },
  }),
  baseURL: SERVER_URL,
  trustedOrigins: [
    CLIENT_URL,
    "http://localhost:3000",
  ],
  account: {
    skipStateCookieCheck: true,
  },
  advanced: {
    useSecureCookies: SERVER_URL.startsWith("https://"),
    trustedProxyHeaders: true,
    defaultCookieAttributes: {
      sameSite: SERVER_URL.startsWith("https://") ? "none" : "lax",
      secure: SERVER_URL.startsWith("https://"),
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${SERVER_URL}/api/auth/callback/google`,
    },
  },
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
});

module.exports = { auth };
