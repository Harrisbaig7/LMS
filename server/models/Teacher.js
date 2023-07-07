const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Teacher", teacherSchema);