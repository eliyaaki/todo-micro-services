const mongoose = require("mongoose");
const log = require("./logger");

async function connectToDb() {
  const dbUri = process.env.DB_URI || "mongodb://127.0.0.1/auth-service";
  try {
    log.info("attempting to connect to db: " + dbUri);
    await mongoose.connect(dbUri);
    log.info("Connected to database: " + dbUri);
  } catch (error) {
    log.info(error);
    process.exit(1);
  }
}

module.exports = connectToDb;
