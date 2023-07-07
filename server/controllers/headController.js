const Head = require('../models/Head');
const Student = require('../models/Head');
const Class = require('../models/Class');
const Course = require("../models/Course");

/* Controllers for Head */

/// View Dashboard
const viewDashboard = async (req, res, next) => {

    Head.find({}).populate("user").then(data => {
        res.json(data);
    }, err => next(err)).catch(err => {
        res.send(err);
    });
}

/// getCourseMaterial
const getCourseMaterial = (req, res, next) => {
    Course.findById(req.params.cid)
        .then((data) => {
            res.statuscode = 200
            res.setHeader('Content-type', 'application/json');
            res.json(data.courseMaterial);
        }, (err) => next(err)).catch((err) => next(err));
}


///  Get the Results of Students
const getStudentResults = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        // Find the student by ID and populate the enrolledCourses field
        const student = await Student.findById(studentId).populate({
            path: "enrolledCourses",
            populate: {
                path: "assignments.aID quizzes.qID",
                model: Course,
            },
        });

        if (!student) {
            res.status(404).json({ error: "Student not found" });
        }

        res.json(student.enrolledCourses);
    } catch (error) {
        console.error("Error fetching student results:", error);
        res.status(500).json({ error: "Server error" });
    }
}

/// Class By id
/// get class by id
const getClassById = (req, res, next) => {
    Class.findById(req.params.cid).populate("students.sid").populate("teacher", "name").then(data => {
        res.json(data);
    }, err => next(err)).catch(err => {
        console.log(err);
    });

}

/// Course Results
/// Function to fetch the result of a course by its ID
const getCourseResultById = async (req, res, next) => {

    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId)
            .populate('quizzes.qID', 'grades.marks')
            .populate('assignments.aID', 'grades.marks')
            .populate('midTerm.grade.student', 'marks')
            .populate('final.grade.student', 'marks');

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            //throw new Error('Course not found');
        }

        let totalQuizzesMarks = 0;
        let totalAssignmentsMarks = 0;
        let totalMidTermMarks = 0;
        let totalFinalMarks = 0;
        let totalStudents = 0;

        // Calculate the sum of marks for quizzes
        for (const quiz of course.quizzes) {
            totalQuizzesMarks += quiz.qID.grades.reduce((total, grade) => total + grade.marks, 0);
        }

        // Calculate the sum of marks for assignments
        for (const assignment of course.assignments) {
            totalAssignmentsMarks += assignment.aID.grades.reduce((total, grade) => total + grade.marks, 0);
        }

        // Calculate the sum of marks for mid-term
        for (const grade of course.midTerm.grade) {
            totalMidTermMarks += grade.marks;
            totalStudents++;
        }

        // Calculate the sum of marks for final
        for (const grade of course.final.grade) {
            totalFinalMarks += grade.marks;
            totalStudents++;
        }

        const averageQuizzesMarks = totalQuizzesMarks / course.quizzes.length;
        const averageAssignmentsMarks = totalAssignmentsMarks / course.assignments.length;
        const averageMidTermMarks = totalMidTermMarks / totalStudents;
        const averageFinalMarks = totalFinalMarks / totalStudents;

        const courseResult = {
            averageQuizzesMarks,
            averageAssignmentsMarks,
            averageMidTermMarks,
            averageFinalMarks
        };

        return courseResult;
        res.json(courseResult);
    } catch (error) {
        console.error('Error fetching course result:', error);
        res.status(500).json({ error: "Server error" });
        //throw error;
    }
}



// For any month
// Controller for retrieving the count of students added for a specific month and year
async function getStudentCountForMonth(req, res) {
    try {
        const { month, year } = req.body;

        // Validate month and year inputs
        if (!month || !year) {
            return res.status(400).json({ error: "Month and year are required" });
        }

        // Set the start and end dates based on the requested month and year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Count the students enrolled between the start and end dates
        const studentCount = await Student.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        res.json({ count: studentCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the count of students for the requested month" });
    }
}


module.exports = {
    getStudentCountForMonth,
    getStudentResults,
    getCourseMaterial,
    getClassById,
    getCourseResultById,
    viewDashboard
}