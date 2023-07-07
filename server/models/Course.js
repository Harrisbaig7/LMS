const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Types.ObjectId,
        ref: "Teacher",
    },

    name: {
        type: String,
        required: true
    },
    
    courseMaterial: {
        type: [
            {
                name: String,
                authorName: String,
                edition: Number
            }
        ]
    },

    assignments: {
        type: [
            {
                aID: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Assignment' 
                }
            }
        ]
    },

    quizzes: {
        type: [
            {
                qID: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Quiz' 
                }
            }
        ]
    },

    midTerm:
    {
        grade: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student"
                },
                marks: {
                    type: Number,
                },
            },
        ],
        dueDate: {
            type: Date,
        },
    },

    final: {
        grade: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student"
                },
                marks: {
                    type: Number,
                },
            },
        ],
        dueDate: {
            type: Date,
        },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);