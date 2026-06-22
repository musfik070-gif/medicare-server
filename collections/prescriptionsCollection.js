const connectDB = require("../config/db");

async function getPrescriptionsCollection() {
  const db = await connectDB();
  return db.collection("prescriptions");
}

module.exports = getPrescriptionsCollection;
