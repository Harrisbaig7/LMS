const Course = require("../models/Course");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const User = require('../models/User');

const login = (req, res) => {
  const { username, password } = req.query;
  if (username === "admin" && password === "password") {
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid username or password");
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      const isPasswordValid = password === user.password;
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "1d",
      });
      res.cookie("jwt-token", token, {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
      });
      if (isPasswordValid) {
        res.json({ message: user });
      } else {
        res.json({ message: "Incorrect password." });
      }
    } else {
      res.json({ message: "User not found." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const studentprofile = (req, res, next) => {
  Student.find({})
    .populate("user")
    .populate("enrolledCourses", "name  teacher")
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      res.send(err);
    });
};

const getassignment = function (req, res, next) {
  Course.findById(req.params.courseid)
    .then(
      (course) => {
        res.statuscode = 200;
        res.json(course.assignments);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const getmaterials = function (req, res, next) {
  Course.findById(req.params.courseid)
    .then(
      (course) => {
        res.statuscode = 200;
        res.json(course.courseMaterial);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

// Show Dashboard "Adil's Route"

const showDashboard = async (req, res) => {
  try {
    const studentId = req.params.sid;

    const students = await Student.findById(studentId).populate(
      "enrolledCourses",
      "name"
    );

    if (!students) {
      return res.status(404).json({ error: "Student not found" });
    }

    const enrolledCourses = students.enrolledCourses;

    const courseDetails = [];

    for (const courseId of enrolledCourses) {
      const course = await courses
        .findById(courseId)
        .populate("teacher", "name")
        .populate({
          path: "quizzes.qID",
          select: "name",
          populate: {
            path: "class",
            select: "name",
          },
        });

      if (!course) {
        continue;
      }

      const { name, teacher, quizzes } = course;
      const teacherName = teacher ? teacher.name : "N/A";
      const quizDetails = quizzes.map((quiz) => ({
        quizName: quiz.qID.name,
        className: quiz.qID.class ? quiz.qID.class.name : "N/A",
      }));

      courseDetails.push({
        courseName: name,
        teacherName,
        className: quizDetails,
      });
    }

    res.json(courseDetails);
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ error: "Error fetching student dashboard" });
  }
};

// Show Grades "Adil's Route"

const viewGrades = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await courses
      .findById(courseId)
      .populate({
        path: "assignments.aID",
        select: "grades.marks",
        populate: {
          path: "grades.student",
          select: "marks",
        },
      })
      .populate({
        path: "quizzes.qID",
        select: "grades.marks",
        populate: {
          path: "grades.student",
          select: "marks",
        },
      })
      .populate("midTerm.grade.student", "marks")
      .populate("final.grade.student", "marks");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const studentGrades = {
      assignments: [],
      quizzes: [],
      midTerm: [],
      final: [],
    };

    for (const assignment of course.assignments) {
      const assignmentMarks = {
        aID: assignment.aID._id,
        marks: assignment.aID.grades[0].marks,
      };
      studentGrades.assignments.push(assignmentMarks);
    }

    for (const quiz of course.quizzes) {
      const quizMarks = {
        qID: quiz.qID._id,
        marks: quiz.qID.grades[0].marks,
      };
      studentGrades.quizzes.push(quizMarks);
    }

    for (const grade of course.midTerm.grade) {
      const midtermMarks = {
        student: grade.student._id,
        marks: grade.marks,
      };
      studentGrades.midTerm.push(midtermMarks);
    }

    for (const grade of course.final.grade) {
      const finalMarks = {
        student: grade.student._id,
        marks: grade.marks,
      };
      studentGrades.final.push(finalMarks);
    }

    return res.json(studentGrades);
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ error: "Error fetching student dashboard" });
  }
};

const studentResult = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "enrolledCourses"
    );
    if (!student) {
      return res.status(404).send({ error: "Student not found" });
    }
    const courses = student.enrolledCourses;
    const marks = [];
    let totalGradePoints = 0;
    let totalCredits = 0;
    for (const course of courses) {
      const midTermGrade = Course.midTerm.grade.find(
        (grade) => grade.student.toString() === student._id.toString()
      );
      const finalGrade = Course.final.grade.find(
        (grade) => grade.student.toString() === student._id.toString()
      );
      const midTermMarks = midTermGrade ? midTermGrade.marks : 0;
      const finalMarks = finalGrade ? finalGrade.marks : 0;
      let quizMarks = 0;
      for (const quiz of course.quizzes) {
        const quizGrade = Quiz.grades.find(
          (grade) => grade.student.toString() === student._id.toString()
        );
        quizMarks += quizGrade ? quizGrade.marks : 0;
      }
      let assignmentMarks = 0;
      for (const assignment of course.assignments) {
        const assignmentGrade = Assignment.grades.find(
          (grade) => grade.student.toString() === student._id.toString()
        );
        assignmentMarks += assignmentGrade ? assignmentGrade.marks : 0;
      }
      const totalMarks =
        assignmentMarks * 0.1 +
        quizMarks * 0.15 +
        midTermMarks * 0.25 +
        finalMarks * 0.5;
      let gradePoints = 0;
      if (totalMarks >= 90) {
        gradePoints = 4;
      } else if (totalMarks >= 80) {
        gradePoints = 3;
      } else if (totalMarks >= 70) {
        gradePoints = 2;
      } else if (totalMarks >= 60) {
        gradePoints = 1;
      } else {
        gradePoints = 0;
      }
      totalCredits += course.credits;
      totalGradePoints += gradePoints * course.credits;
      marks.push({
        course: course.name,
        midTermMarks,
        finalMarks,
        quizMarks,
        assignmentMarks,
        totalMarks,
        gpa: gradePoints,
      });
    }
    const cgpa = totalGradePoints / totalCredits;
    res.send({ courses: marks, cgpa });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  studentprofile,
  getassignment,
  getmaterials,
  login,
  signIn,
  showDashboard,
  studentResult,
  viewGrades
};
