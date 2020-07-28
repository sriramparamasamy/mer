const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const User = require("../../models/user");
const Student = require("../../models/student");

//@route POST /api/student
//@desc post student details
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("studentname", "student name is required").not().isEmpty(),
      check("studentclass", "class is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentname, studentclass, yearofpassing } = req.body;

      let studentFields = {};

      studentFields.user = req.user.id;
      if (studentname) studentFields.studentname = studentname;
      if (studentclass) studentFields.studentclass = studentclass;
      if (yearofpassing) studentFields.yearofpassing = yearofpassing;

      let student = await Student.findOne({ user: req.user.id });

      if (student) {
        student = await Student.findOneAndUpdate(
          { $set: studentFields },
          { user: req.user.id },
          { new: true }
        );
      }

      student = new Student(studentFields);
      await student.save();
      res.json(student);
    } catch (err) {
      console.error(err.messages);
      res.status(500).send("server error");
    }
  }
);

//@route get /api/student
//@desc get student details
//@access private

router.get("/", auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: "Student not found for this user" });
    }
    res.json(student);
  } catch (err) {
    console.error(err.messages);
    res.status(500).send("server error");
  }
});

module.exports = router;
