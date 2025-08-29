// const TASK = require("../model/task");
const APP = require("../model/app");
let jwt = require('jsonwebtoken')

exports.sequre = async function (req, res, next) {
    try {
        let token = req.headers.authorization
        // console.log(token);

        if (!token) { throw new Error("please require token") }
        let decode = jwt.verify(token, 'verifyotp')
          console.log(decode);

        const usercheck = await APP.findOne({ id : decode._id});
         console.log(usercheck);

        if (!usercheck) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found or unauthorized'
            });
        }
        //  req.user = usercheck._id;
    req.user = usercheck;
        next();
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

