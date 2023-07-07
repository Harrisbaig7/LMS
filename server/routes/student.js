var express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
var studentController = require("../controllers/studentController");

router.get("/", (req, res, next) => {
  res.send("Hello, Student");
});

// Authentication - Login (Hammad)
router.get("/login", studentController.login);

// Authentication - Signup (Ismail)
router.post("/login", studentController.signIn);

//Moeez Ahmed
router.get("/userprofile", protect, studentController.studentprofile);

//Hassan Sajjad
router.get("/student-dashboard/:courseid/coursematerial", protect, studentController.getmaterials);

//Bilal Shakir
router.get("/student-dashboard/:courseid/getassignment", protect, studentController.getassignment);

// Show Dashboard "Adil's Route"
router.get("/student-dashboard/:sid", protect, studentController.showDashboard);

// Show Grades "Adil's Route"
router.get("/student-dashboard/:courseid/enrolled-course/grades", protect, studentController.viewGrades);

//Bilal Gondal
router.get("/student/:id/result", protect, studentController.studentResult);

module.exports = router;
