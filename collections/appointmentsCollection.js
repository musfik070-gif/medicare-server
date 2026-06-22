const connectDB = require("../config/db");

async function getAppointmentsCollection() {
  const db = await connectDB();
  return db.collection("appointments");
}

module.exports = getAppointmentsCollection;
