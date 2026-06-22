const connectDB = require("../config/db");

async function getPaymentsCollection() {
  const db = await connectDB();
  return db.collection("payments");
}

module.exports = getPaymentsCollection;
