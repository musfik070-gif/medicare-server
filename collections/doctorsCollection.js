const connectDB = require("../config/db");

async function getDoctorsCollection() {
  const db = await connectDB();
  return db.collection("doctors");
}

module.exports = getDoctorsCollection;
