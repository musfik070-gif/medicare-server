const connectDB = require("../config/db");

async function getReviewsCollection() {
  const db = await connectDB();
  return db.collection("reviews");
}

module.exports = getReviewsCollection;
