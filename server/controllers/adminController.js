const User = require("../models/User");
const Class = require("../models/Class");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const bcrypt = require("bcrypt");

// @desc    View Dashboard
// @route   GET /admin
// @access  Private
module.exports.dashboard = (req, res, next) => {
  res.send("Show Dashboard");
};

// @desc    View all classes
// @route   GET /admin/classes
// @access  Private
module.exports.getClasses = (req, res, next) => {
  Class.find({})
    .populate("teacher")
    .populate("students.sid")
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    View one class
// @route   GET /admin/classes/:cid
// @access  Private
module.exports.getSingleClass = (req, res, next) => {
  Class.find({ _id: req.params.cid })
    .populate("teacher")
    .populate("students.sid")
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    View all students
// @route   GET /admin/students
// @access  Private
module.exports.getStudents = (req, res, next) => {
  Student.find({})
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    View one student
// @route   GET /admin/students/:sid
// @access  Private
module.exports.getSingleStudent = (req, res, next) => {
  Student.findById(req.params.sid)
    .then(
      (data) => {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    View all teachers
// @route   GET /admin/teachers
// @access  Private
module.exports.getTeachers = (req, res, next) => {
  Teacher.find({})
    .then(
      (data) => {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    View one teacher
// @route   GET /admin/teachers/:tid
// @access  Private
module.exports.getSingleTeacher = (req, res, next) => {
  Teacher.findById(req.params.tid)
    .then(
      (data) => {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    Add a teacher
// @route   POST /admin/addteacher
// @access  Private
module.exports.addTeacher = async (req, res, next) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    email: req.body.email,
    password: hashedPassword,
  });
  newUser
    .save()
    .then((data) => {
      const newTeacher = new Teacher({
        user: data._id,
        name: req.body.name,
        designation: req.body.designation,
      });
      newTeacher
        .save()
        .then(() => res.status(200).json("Teacher Added successfully!"))
        .catch((error) => console.log(error));
    })
    .catch((error) => res.status(409).json("Error, email address already exists!"));
};

// @desc    Add a class
// @route   POST /admin/addclass
// @access  Private
module.exports.addClass = (req, res, next) => {
  Class.create(req.body)
    .then(
      (data) => {
        console.log("Added a new class");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    Add a student
// @route   POST /admin/addstudent
// @access  Private
module.exports.addStudent = async (req, res, next) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    email: req.body.email,
    password: hashedPassword,
  });
  newUser
    .save()
    .then((data) => {
      const newStudent = new Student({
        user: data._id,
        name: req.body.name,
        rollno: req.body.rollno,
      });
      newStudent
        .save()
        .then(() => res.status(200).json("Student Added successfully!"))
        .catch((error) => console.log(error));
    })
    .catch((error) => res.status(409).json("Error, email address already exists!"));
};

// @desc    Add a student in class
// @route   PUT /assignstudent/:cid/:sid
// @access  Private
module.exports.addStudentInClass = (req, res, next) => {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    {
      $push: {
        students: {
          sid: req.params.sid,
        },
      },
    },
    { new: true, upsert: false }
  )
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .catch((err) => {
      console.log(err);
    });
};

// @desc    Add a teacher in class
// @route   PUT /assignteacher/:cid/:tid
// @access  Private
module.exports.addTeacherInClass = (req, res, next) => {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    { teacher: req.params.tid }
  ).then(
    (data) => {
      res.json(data);
    },
    (err) => next(err)
  );
};

// @desc    Delete a teacher
// @route   DELETE /deleteteacher/:tid
// @access  Private
module.exports.deleteTeacher = async (req, res, next) => {
    try {
        const teacher = await Teacher.findOne({_id: req.params.tid});
        await User.deleteOne({_id: teacher.user});
        await Teacher.deleteOne({ _id: teacher._id });
        res.json("Teacher deleted successfully!");
    } catch (error) {
        console.log(error);
        res.json("Error");
    }
};

// @desc    Delete a student
// @route   DELETE /deletestudent/:sid
// @access  Private
module.exports.deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findOne({_id: req.params.sid});
        await User.deleteOne({_id: student.user});
        await Student.deleteOne({ _id: student._id });
        res.json("Student deleted successfully!");
    } catch (error) {
        console.log(error);
        res.json("Error");
    }
};

// @desc    Delete a class
// @route   DELETE /deleteclass/:cid
// @access  Private
module.exports.deleteClass = (req, res, next) => {
  Class.deleteOne({ _id: req.params.cid })
    .then(
      (data) => {
        res.json(data);
      },
      (err) => next(err)
    )
    .then((err) => {
      console.log(err);
    });
};
