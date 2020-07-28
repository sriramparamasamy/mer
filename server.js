const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Init Middleware

app.use(express.json());

//To initiate the connection of mongodb

const PORT = process.env.PORT || "5000";

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, x-auth-token, Accept"
  );
  next();
});

app.get("/", (req, res) => res.send("Api running"));

//routes

app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/student", require("./routes/api/student"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
connectDB();
