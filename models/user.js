const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow this field to be optional for local login users
    },
    name: {
        type: String,
        required: false, // Make optional for Google users
    },
    email: {
        type: String,
        required: false, // Make optional for Google users
        unique: true,
        sparse: true, // Allow this field to be optional for Google users
    },
    password: {
        type: String,
        required: false, // Make optional for Google users
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
