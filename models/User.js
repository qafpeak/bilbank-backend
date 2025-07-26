// models/User.js
const { bilbankConnection } = require('../partner/db');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  surname: String,
  username: { type: String, unique: true, sparse: true },
  verificationToken: String,
  verified: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = bilbankConnection.model('User', userSchema);
