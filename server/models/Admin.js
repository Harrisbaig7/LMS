const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Admin", adminSchema);