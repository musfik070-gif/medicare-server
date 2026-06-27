const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI environment variable is not set.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connectDB() {
  try {
    if (!database) {
      await client.connect();

      database = client.db("medicareDB");

      console.log("✅ MongoDB Connected Successfully");
    }

    return database;
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
