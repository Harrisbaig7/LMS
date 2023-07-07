const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getClasses, dashboard, getSingleClass, getStudents,
  getSingleStudent, getTeachers, getSingleTeacher, addTeacher,
  addClass, addStudent, addStudentInClass, addTeacherInClass,
  deleteTeacher, deleteStudent, deleteClass
} = require("../controllers/adminController");

// GET Methods
router.get("/", protect, dashboard);

router.get("/classes", protect, getClasses);

router.get("/classes/:cid", protect, getSingleClass);

router.get("/students", protect, getStudents);

router.get("/students/:sid", protect, getSingleStudent);

router.get("/teachers", protect, getTeachers);

router.get("/teachers/:tid", protect, getSingleTeacher);

// POST Methods
router.post("/addteacher", protect, addTeacher);

router.post("/addclass", protect, addClass);

router.post("/addstudent", protect, addStudent);

// PUT Methods
router.put("/assignstudent/:cid/:sid", protect, addStudentInClass);

router.put("/assignteacher/:cid/:tid", protect, addTeacherInClass);

// DELETE Methods
router.delete("/deleteteacher/:tid", protect, deleteTeacher);

router.delete("/deletestudent/:sid", protect, deleteStudent);

router.delete("/deleteclass/:cid", protect, deleteClass);

module.exports = router;