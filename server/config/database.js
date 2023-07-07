const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/TCS_LMS");
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.italic);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;