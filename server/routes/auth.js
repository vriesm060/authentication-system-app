require('dotenv');

const secret = process.env.SECRET;

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const validate = [
  check('fullName')
    .isLength({ min: 2 })
    .withMessage('Your full name is required.'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

const loginValidate = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

router.post('/register', validate, async (req, res) => {
  // Validate the form:
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  // Check if email already exists:
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists) return res.status(400).send('Email already exists.');

  // Hash the password:
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', loginValidate, async (req, res) => {
  // Validate form:
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  // Check if email exists:
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send('Invalid email or password');

  // Check if password is correct:
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(404).send('Invalid email or or password');

  // Create and assign a token:
  const token = jwt.sign({ _id: user._id, email: user.email }, secret);

  res.header('auth-token', token).send({ message: 'Logged in successfully!', token });
});

module.exports = router;