var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const colors = require("colors");
const connectDB = require("./config/database");
const port = process.env.PORT || 5000;

// Routers
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var headRouter = require("./routes/head");
var studentRouter = require("./routes/student");
var teacherRouter = require("./routes/teacher");

// Database object imported from config folder
connectDB();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Mounting points
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/head", headRouter);
app.use("/student", studentRouter);
app.use("/teacher", teacherRouter);


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(port, () => console.log(`Server running on port: ${port}`.cyan.italic.bold));