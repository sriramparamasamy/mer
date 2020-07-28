const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    refs: "users",
  },
  studentname: {
    type: String,
    required: true,
  },
  studentclass: {
    type: String,
    required: true,
  },
  marks: [
    {
      maths: {
        type: Number,
        required: true,
      },
      science: {
        type: Number,
        required: true,
      },
    },
  ],
  yearofpassing: {
    type: Date,
    required: true,
  },
});

module.exports = Student = mongoose.model("student", StudentSchema);
