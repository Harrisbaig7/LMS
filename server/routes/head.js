var express = require("express");
const router = express.Router();
const HeadController = require("../controllers/headController");
const { protect } = require("../middlewares/authMiddleware");


/// Dashboard 
/// Hanzala Javed
router.get("/", protect, HeadController.viewDashboard);

/// Student Results
/// Syed Kumail
router.get('/results/student/:id', protect, HeadController.getStudentResults);

/// Class By ID
/// Ahmer Abbas
router.get("/class/:cid", protect, HeadController.getClassById);

/// Getting the course materials
/// Abdullah Farhan
router.get("/materials", protect, HeadController.getCourseMaterial);

/// Course Results
/// Muhammad Uzair
router.get("/results/course/:cid", protect, HeadController.getCourseResultById);

/// Graph
/// [Abubakr Siddique FA20-BCS-098] 
router.get("/graph", protect, HeadController.getStudentCountForMonth);


module.exports = router;