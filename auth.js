const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const connectDB = require("./config/db");

// Retrieve MongoClient instance and the db object
const client = connectDB.client;
const db = client.db("medicareDB");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client,
    collectionNames: {
      // Map Better Auth 'user' to the existing 'users' collection to maintain unified user records
      user: "users",
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://medicare-client-gamma.vercel.app",
    "http://localhost:3000"
  ],
  advanced: {
    crossSubdomainCookies: {
      enabled: false
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      partitioned: true
    },
    useSecureCookies: true,
    disableCSRFCheck: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`
    },
  },
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
});

module.exports = { auth };
