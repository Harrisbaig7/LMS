const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    class: {
        type: mongoose.Types.ObjectId,
        ref: 'Class'
    },

    quizFile : {
        type: Buffer,
    },

    dueDate: {
        type: Date,
    },

    totalMarks: {
        type: Number,
    },
    
    grades: {
        type: [
            {
                student: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Student'
                },
                marks: {
                    type: Number
                }
            }
        ]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);