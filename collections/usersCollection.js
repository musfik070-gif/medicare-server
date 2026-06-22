const connectDB = require("../config/db");

async function getUsersCollection() {
  const db = await connectDB();
  return db.collection("users");
}

module.exports = getUsersCollection;
