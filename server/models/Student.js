const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },

    name: {
        type: String,
        required: true,
    },

    rollno: {
        type: String, 
    },
    
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model("Student", studentSchema);