const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

const auth = require("../../middleware/auth");

//@route GET api/auth
//@desc get auth user
//@access public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (err) {
    console.error(err.messages);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    check("email", "Please enter an Email Id").isEmail(),
    check("password", "Please enter a password with min of 6 digits").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //   res.send("User Registered");
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

module.exports = router;
