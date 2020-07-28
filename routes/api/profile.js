const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("config");
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models/user");
const { check, validationResult } = require("express-validator");

// @route GET/api/profile/me
// @desc get the profile of login user
// @access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "No profile found for this user" });
    }
    res.status(200).json({ profile });
  } catch (err) {
    console.error(err.messages);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/profile
// @desc post the profile and update profile
// @access private

router.post(
  "/",
  [
    auth,
    [
      check("skills", "please enter a skill").not().isEmpty(),
      check("status", "Please enter a status").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      skills,
      location,
      bio,
      status,
      githubusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedIn,
    } = req.body;

    console.log(req.body);

    //Build profile objects

    let profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (githubusername) profileFields.githubusername = githubusername;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (skills) {
      profileFields.skills = skills.split(",").map((skills) => skills.trim());
    }

    // Build Social Objects
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedIn) profileFields.social.linkedIn = linkedIn;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // create
      console.log(profileFields, "in backend");
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
      console.log(profile);
    } catch (err) {
      console.error(err.messages);
      res.status(500).send("server error");
    }
  }
);

// @route GET /api/profile
// @desc  Create and update profile
// @access public

router.get("/", async (req, res) => {
  try {
    let profile = await Profile.find().populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).send("There are no profiles found");
    }
    res.json(profile);
  } catch (err) {
    console.log(err.messages);
    res.status(500).send("server error");
  }
});

// @route GET /api/profile
// @desc  Create and update profile
// @access public

router.get("/", async (req, res) => {
  try {
    let profile = await Profile.find().populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).send("There are no profiles found");
    }
    res.json(profile);
  } catch (err) {
    console.log(err.messages);
    res.status(500).send("server error");
  }
});

// @route GET /api/profile/user/:user_id
// @desc  Create and update profile
// @access public

router.get("/user/:user_id", async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).send("There are no profiles found");
    }
    res.json(profile);
  } catch (err) {
    console.log(err.messages);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "There are no profiles found" });
    }
    res.status(500).send("server error");
  }
});

// @route Delete /api/profile
// @desc  Delete profile and user
// @access public

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.send("User deleted");
  } catch (err) {
    console.log(err.messages);
    res.status(500).send("server error");
  }
});

// @route PUT /api/profile/experience
// @desc  Add experience
// @access private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      let profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json({ profile });
    } catch (err) {
      console.error(err.messages);
      res.status(500).send("Server Error");
    }
  }
);

// @route Delete /api/profile/experience/:exp_id
// @desc  Delete profile experience
// @access private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = await profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.messages);
    res.status(500).send("server error");
  }
});

// @route PUT /api/profile/education
// @desc  Add experience
// @access private

router.put(
  "/education",
  [
    auth,
    [
      check("degree", "Degree is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      let profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json({ profile });
    } catch (err) {
      console.error(err.messages);
      res.status(500).send("Server Error");
    }
  }
);

// @route Delete /api/profile/education/:edu_id
// @desc  Delete profile education
// @access private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = await profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.messages);
    res.status(500).send("server error");
  }
});

// @route GET /api/profile/github/:username
// @desc  get user repos from github
// @access public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
