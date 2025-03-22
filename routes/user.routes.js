const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// /user/test

// router.get("/test", (req, res) => {
//   res.send("user TEST route");
// });

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // return res.send("INVLAID DATA");
      return res.status(400).json({
        errors: errors.array(),
        message: "invalid data",
      });
    }

    const { email, password, username } = req.body;
    const hashpw = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      email,
      username,
      password: hashpw,
    });

    res.json(newUser);

    // console.log(errors);
    // res.send(errors);

    // console.log(req.body);
    // res.send("user registered");
  }
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "invalid data",
      });
    }

    const { username, password } = req.body;
    const user = await UserModel.findOne({
      username: username,
    });
    if (!user) {
      return res.status(400).json({
        messagne: "username or password is incorrect",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    // if (!isMatch) {
    //   return res.status(400).json({
    //     message: "username or password is incorrect",
    //   });
    // }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET
    );
    res.cookie("token", token);
    res.send("Logged in");
  }
);

module.exports = router;
