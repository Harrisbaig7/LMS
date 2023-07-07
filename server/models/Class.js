const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    teacher: {
        type: mongoose.Types.ObjectId,
        ref: 'Teacher'
    },
    
    students: {
        type: [
            {
                sid: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Student' 
                }
            }
        ]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Class", classSchema);