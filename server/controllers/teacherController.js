const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const Quiz = require("../models/Quiz");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

//GET
const getDashboardInfo = async (req, res, next) => {
  try {
   const teacherId = req.params.tid;
   const teacher = await Teacher.findById(teacherId).exec();
   if (!teacher) {
     throw new Error('Teacher not found');
   }
 
   const classes = await Class.find({ teacher: teacherId }).populate('students.sid').exec();
   const classData = [];
 
   for (let classItem of classes) {
     const studentCount = classItem.students.length;
     const className = classItem.name;
     const students = classItem.students.map((student) => student.sid.name);
     classData.push({ className, studentCount, students });
   }
   
   res.status(200).json(classData);

  }catch (error) {
   throw new Error('Error retrieving classes and student counts: ' + error.message);
  }
 
 }


const getAssignment = (req, res) => {
  const { classid, aid } = req.params;

  // Find the assignment based on classid and aid
  Assignment.findOne({ class: classid, _id: aid })
    .populate("class") 
    .populate("grades.student") 
    .then((assignment) => {
      if (!assignment) {
        res.status(404).json({ error: "Assignment not found" });
      }

      res.status(200).json(assignment);
    })
    .catch((err) => {
      console.log("Error retrieving assignments:", err);
      res.status(500).json({ error: "Internal server error" });
    });
};

const getAllAssignments = (req, res) => {
  Assignment.find({ class: req.params.classid })
    .populate("class") 
    .populate("grades.student") 
    .then((assignment) => {
      if (!assignment) {
        res.status(404).json({ error: "Assignments not found" });
      }

      res.status(200).json(assignment);
    })
    .catch((err) => {
      console.log("Error retrieving assignment:", err);
      res.status(500).json({ error: "Internal server error" });
    });
};

const viewQuiz=(req,res)=>{

  Quiz.findOne({ class: req.params.classid, _id: req.params.qid })
    .populate("class") 
    .populate("grades.student") 
    .then((quiz) => {
      if (!quiz) {
        res.status(404).json({ error: "Quiz not found" });
      }

      res.status(200).json(quiz);
    })
    .catch((err) => {
      console.log("Error retrieving quiz:", err);
      res.status(500).json({ error: "Internal server error" });
    });
}

const viewAllQuiz=(req,res)=>{
  Quiz.find({ class: req.params.classid })
    .populate("class") 
    .populate("grades.student") 
    .then((quiz) => {
      if (!quiz) {
        res.status(404).json({ error: "Quizzes not found" });
      }

      res.status(200).json(quiz);
    })
    .catch((err) => {
      console.log("Error retrieving quizzes:", err);
      res.status(500).json({ error: "Internal server error" });
    });
}

const viewAssignMarks = (req, res, next) => {
  Assignment.findById(req.params.aid, {grades: true})
    .populate('grades.student')
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Marks not found.' });
      }

      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: 'An error occurred while retrieving marks.' });
    });
};

const viewQuizMarks = (req, res, next) => {
  Quiz.findById(req.params.qid, {grades: true})
    .populate('grades.student')
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Marks not found.' });
      }

      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: 'An error occurred while retrieving marks.' });
    });
};

const viewMidMarks = (req, res, next) => {
  Course.findById(req.params.courseid)
    .populate('midTerm.grade.student')
    .then( (data) => {
    
      const showData = data.midTerm.grade
      res.status(200).json(showData)

    }, err => {
      console.log(err);
      res.status(404).json({ message: 'Course not found' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred while retrieving marks.' });
    })
}

const viewFinalMarks = (req, res, next) => {
  Course.findById(req.params.courseid)
    .populate('midTerm.grade.student')
    .then( (data) => {

      const showData = data.final.grade
      res.status(200).json(showData)

    }, err => {
      console.log(err);
      res.status(404).json({ message: 'Course not found' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred while retrieving marks.' });
    })
}

const viewMaterial =  (req, res, next) => {
  Course.findById(req.params.courseid, {courseMaterial: true})
    .then(
      (data) => {
        if (!data) {
          return res.status(404).json({ message: "Material not found!" });
        }

        res.status(200).json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error!" });
    });
}


//POST
const addAssignment = (req, res, next) => {
  Assignment.create({ ...req.body, class: req.params.classId })
    .then(
      (assignment) => {
        console.log("Assignment has been added");

        res.statuscode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(assignment);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const addQuiz = (req, res, next) => {
  Quiz.create({ ...req.body, class: req.params.classId })
    .then(
      (quiz) => {
        console.log("Quiz has been added");

        res.statuscode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(quiz);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const addMaterial = async (req, res, next) => {
  try {
    const { courseid } = req.params;
    const { name, authorName, edition } = req.body;

    const course = await Course.findById(courseid);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const newMaterial = {
      name: name,
      authorName: authorName,
      edition: edition,
    };

    course.courseMaterial.push(newMaterial);
    await course.save();

    res
      .status(200)
      .json({ message: "Course material successfully added", course });
  } catch (err) {
    next(err);
  }
};

//PUT
const updateAssignment = (req, res, next) => {
  const { classId, aId } = req.params;
  const updateData = req.body;

  // Update the assignment
  Assignment.findByIdAndUpdate(aId, updateData)
    .then((updatedAssignment) => {
      if (!updatedAssignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.status(200).json({
        message: "Assignment updated successfully",
        assignment: updatedAssignment,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to update the assignment" });
    });
};

const updateQuiz = (req, res, next) => {
  const { classId, qId } = req.params;
  const updateData = req.body;

  // Update the Quiz
  Quiz.findByIdAndUpdate(qId, updateData)
    .then((updatedQuiz) => {
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.status(200).json({
        message: "Quiz updated successfully",
        quiz: updatedQuiz,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to update the Quiz" });
    });
};

const addQuizMarks = (req, res, next) => {
  const { qid, sid } = req.params;
  const { marks } = req.body;

  Quiz.findById(qid)
    .then((quiz) => {
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const studentExists = quiz.grades.find(
        (entry) => entry.student.toString() === sid
      );
      if (studentExists) {
        return res
          .status(400)
          .json({ error: "Student's marks already exist", quiz });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = {
            student: sid,
            marks: marks,
          };

          quiz.grades.push(studentMarks);
          return quiz.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Quiz marks added successfully", quiz });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to add quiz marks" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Failed to find the quiz" });
    });
};

const updateQuizMarks = (req, res, next) => {
  const { qid, sid } = req.params;
  const { marks } = req.body;

  Quiz.findById(qid)
    .then((quiz) => {
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = quiz.grades.find(
            (entry) => entry.student.toString() === sid
          );

          if (!studentMarks) {
            return res
              .status(404)
              .json({ error: "Quiz marks not found for the student" });
          }

          studentMarks.marks = marks;
          return quiz.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Quiz marks updated successfully", quiz });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to update quiz marks" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Failed to find the quiz" });
    });
};

const addAssignmentMarks = (req, res, next) => {
  const { aid, sid } = req.params;
  const { marks } = req.body;

  Assignment.findById(aid)
    .then((assignment) => {
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const studentExists = assignment.grades.find(
        (entry) => entry.student.toString() === sid
      );
      if (studentExists) {
        return res
          .status(400)
          .json({ error: "Student's marks already exist", assignment });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = {
            student: sid,
            marks: marks,
          };

          assignment.grades.push(studentMarks);
          return assignment.save();
        })
        .then(() => {
          res
            .status(200)
            .json({
              message: "Assignment marks added successfully",
              assignment,
            });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to add assignment marks" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Failed to find the assignment" });
    });
};

const updateAssignmentMarks = (req, res, next) => {
  const { aid, sid } = req.params;
  const { marks } = req.body;

  Assignment.findById(aid)
    .then((assignment) => {
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = assignment.grades.find(
            (entry) => entry.student.toString() === sid
          );

          if (!studentMarks) {
            return res
              .status(404)
              .json({ error: "Assignment marks not found for the student" });
          }

          studentMarks.marks = marks;
          return assignment.save();
        })
        .then(() => {
          res
            .status(200)
            .json({
              message: "Assignment marks updated successfully",
              assignment,
            });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to update assignment marks" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Failed to find the assignment" });
    });
};

const addMidtermMarks = (req, res, next) => {
  const { courseid, sid } = req.params;
  const { marks } = req.body;

  Course.findById(courseid)
    .then((course) => {
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const studentExists = course.midTerm.grade.find(
        (entry) => entry.student.toString() === sid
      );
      if (studentExists) {
        return res
          .status(400)
          .json({ error: "Student's marks already exist", course });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = {
            student: sid,
            marks: marks,
          };

          course.midTerm.grade.push(studentMarks);

          return course.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Midterm marks added successfully", course });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to add midterm marks" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Failed to find the course" });
    });
};

const updateMidtermMarks = (req, res, next) => {
  const { courseid, sid } = req.params;
  const { marks } = req.body;

  Course.findById(courseid)
    .then((course) => {
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = course.midTerm.grade.find(
            (g) => g.student.toString() === sid.toString()
          );

          if (!studentMarks) {
            return res
              .status(404)
              .json({ error: "Midterm marks not found for the student" });
          }

          studentMarks.marks = marks;
          return course.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Midterm marks updated successfully", course });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to update midterm marks" });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to find the course" });
    });
};

const addFinalMarks = (req, res, next) => {
  const { sid, courseid } = req.params;
  const { marks } = req.body;

  Course.findById(courseid)
    .then((course) => {
      if (!course) {
        return res.status(404).send("Course not found");
      }
      const studentExists = course.final.grade.find(
        (entry) => entry.student.toString() === sid
      );
      if (studentExists) {
        return res
          .status(400)
          .json({ error: "Student's marks already exist", course });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const studentMarks = {
            student: sid,
            marks: marks,
          };

          course.final.grade.push(studentMarks);

          return course.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Final marks added successfully", course });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to add final marks" });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Server error");
    });
};

const updateFinalMarks = (req, res, next) => {
  Course.findById(req.params.courseid)
    .then((course) => {
      try {
        course.final.grade.filter(
          (item) => item.student.toString() == req.params.sid
        )[0].marks = req.body.marks;
        course.save();
        res.status(200).json("Marks updated successfully!");
      } catch (error) {
        res.status(404).json("Invalid Student ID");
        console.log(error);
      }
    })
    .catch((error) => {
      res.status(404).json("Course ID not found!");
      console.log(error.message);
    });
};

const updateCourseMaterial = (req, res, next) => {
  const { name, authorName, edition } = req.body;

  // Update the material
  Course.findOneAndUpdate(
    { _id: req.params.courseId, "courseMaterial._id": req.params.materialId },
    {
      $set: {
        "courseMaterial.$.name": name,
        "courseMaterial.$.authorName": authorName,
        "courseMaterial.$.edition": edition,
      },
    }
  )
    .then((updatedCourse) => {
      if (!updatedCourse) {
        return res.status(404).json({ error: "Course or material not found" });
      }

      res.status(200).json({
        message: "Material updated successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to update the material" });
    });
};

//DELETE
const deleteAssignment = (req, res, next) => {
  const { aId } = req.params;

  // Remove the assignment from the class
  Class.findByIdAndUpdate(
    { _id: req.params.classId },
    { $pull: { assignments: aId } }
  )
    .then(() => {
      // Delete the assignment
      return Assignment.findByIdAndDelete(aId);
    })
    .then(() => {
      res.status(200).json({ message: "Assignment deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to delete the assignment" });
    });
};

const deleteQuiz = (req, res, next) => {
  const { qId } = req.params;

  // Remove the quiz from the class
  Class.findByIdAndUpdate(
    { _id: req.params.classId },
    { $pull: { quizzes: qId } }
  )
    .then(() => {
      // Delete the quiz
      return Quiz.findByIdAndDelete(qId);
    })
    .then(() => {
      res.status(200).json({ message: "Quiz deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to delete the quiz" });
    });
};

const deleteAssignmentMarks = (req, res, next) => {
  const { aid, sid } = req.params;

  Assignment.findById(aid)
    .then((assignment) => {
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      Student.findById(sid)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const marksIndex = assignment.grades.findIndex(
            (grade) => grade.student.toString() === sid
          );

          if (marksIndex === -1) {
            return res.status(404).json({ error: "Assignment marks not found for the student" });
          }

          assignment.grades.splice(marksIndex, 1);
          assignment.save()
            .then(() => {
              res.json({ message: "Assignment marks deleted successfully", assignment });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).json({ error: "Failed to delete assignment marks" });
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
};

const deleteQuizMarks = (req, res) => {
  const quizId = req.params.qid;
  const studentId = req.params.sid;

  Quiz.findById(quizId)
    .then((quiz) => {
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      Student.findById(studentId)
        .then((student) => {
          if (!student) {
            return res.status(404).json({ error: "Student not found" });
          }

          const marksIndex = quiz.grades.findIndex(
            (grade) => grade.student.toString() === studentId
          );

          if (marksIndex === -1) {
            return res
              .status(404)
              .json({ error: "Quiz marks not found for the student" });
          }

          quiz.grades.splice(marksIndex, 1);
          quiz.save()
            .then(() => {
              res.json({ message: "Quiz marks deleted successfully", quiz });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).json({ error: "Failed to delete quiz marks" });
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Failed to find the student" });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Failed to find the quiz" });
    });
};

const deleteMidTermMarks = (req, res) => {
  const courseId = req.params.courseid;
  const studentId = req.params.sid;

  Course.findById(courseId)
    .populate("midTerm.grade.student")
    .then((course) => {
      // Find the student in the midTerm.grade array and remove their marks
      const studentIndex = course.midTerm.grade.findIndex(
        (entry) => entry.student._id.toString() === studentId
      );
      if (studentIndex !== -1) {
        course.midTerm.grade.splice(studentIndex, 1);
      } else {
        return res
          .status(404)
          .json({ error: "Student not found in midterm grades" });
      }

      // Save the updated course object
      return course.save();
    })
    .then(() => {
      res.status(200).json({ message: "Midterm marks deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    });
};

const deleteFinalMarks = (req, res) => {
  const courseId = req.params.courseid;
  const studentId = req.params.sid;

  Course.findById(courseId)
    .populate("final.grade.student")
    .then((course) => {
      // Find the student in the final.grade array and remove their marks
      const studentIndex = course.final.grade.findIndex(
        (entry) => entry.student._id.toString() === studentId
      );
      if (studentIndex !== -1) {
        course.final.grade.splice(studentIndex, 1);
      } else {
        return res.status(404).json({ error: "Student not found in final grades" });
      }

      // Save the updated course object
      return course.save();
    })
    .then(() => {
      res.status(200).json({ message: "Final marks deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    });
};

const deleteMaterial = (req, res, next) => {
  Course.findOneAndUpdate(
    { _id: req.params.courseid, "courseMaterial._id": req.params.materialid },
    { $pull: { courseMaterial: { _id: req.params.materialid } } }
  )
    .then(
      (data) => {
        if (!data) {
          return res.status(404).json({ message: "Material not found!" });
        }

        res.status(200).json({ message: "Material deleted successfully!" });
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Material could not be deleted!" });
    });
};

module.exports = {
  getDashboardInfo,
  getAssignment,
  getAllAssignments,
  deleteAssignment,
  addAssignment,
  updateAssignment,
  viewQuiz,
  viewAllQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  viewQuizMarks,
  addQuizMarks,
  updateQuizMarks,
  deleteQuizMarks,
  viewAssignMarks,
  addAssignmentMarks,
  updateAssignmentMarks,
  deleteAssignmentMarks,
  viewMidMarks,
  addMidtermMarks,
  updateMidtermMarks,
  deleteMidTermMarks,
  viewFinalMarks,
  addFinalMarks,
  updateFinalMarks,
  deleteFinalMarks,
  viewMaterial,
  addMaterial,
  updateCourseMaterial,
  deleteMaterial,
};
