const { MongoClient, ServerApiVersion } = require("mongodb");

console.log("URI:", process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI;

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
