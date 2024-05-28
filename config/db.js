const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
    });
    console.log("Connected to database");
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1);
  }
};

module.exports = connectDB;
