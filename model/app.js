const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AppUser = new Schema({
    mo: {
        type: String,
        required: [true, "Mobile number is required"],
        unique: true,
        match: [/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"]
    },
    age: {
        type: Number,
        min: [18, "Age must be at least 18"]
    },
    otp: {
        type: String
    },
    otpExpire: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    Usertask: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'task'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,

    }
})
const APP = mongoose.model('app', AppUser , "apps");
module.exports = APP;