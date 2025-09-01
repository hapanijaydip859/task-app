const APP = require('../model/app');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Otp = require("../model/otp");
// exports.getMyTasks = async function(req, res) {
//     try {
//         const userId = req.user._id;
//         console.log("UserId ==> "+ userId);

//         const tasks = await APP.find({ userId });
//         console.log("Task ==> " + tasks);

//         res.status(200).json({
//             status: 'success',
//             message: 'All tasks for this user',
//             data: tasks
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'fail',
//             message: error.message
//         });
//     }
// }
// exports.UserSignup = async function (req, res) {
//     try {
//         const mo = req.body.mo
//         if (!/^[0-9]{10}$/.test(mo)) {
//             return res.status(400).json({ message: 'Invalid mobile number format' });
//         }
//         if (!mo) { return res.status(402).json({ message: 'please enter your valid mobile number' }) }

//         const otp = 1111

//         let now = new Date()
//         let expiresAt = new Date(now.getTime() + 2 * 60000);
//         let user = await APP.findOne({ mo: mo })

//         if (user) {
//             if (user.expiresAt && user.expiresAt > now) {
//                 return res.status(500).json({ message: 'Please wait two minutes before requesting a new OTP' })
//             }
//             user.otp = otp;
//             user.createdAt = now;
//             user.expiresAt = expiresAt;
//             await user.save();
//         }
//         else {
//             user = new APP({ mo, otp, createdAt: now, expiresAt });
//             await user.save();
//         }

//         res.status(202).json({
//             status: 'success',
//             message: 'User create',
//             data: user
//         })
//     } catch (error) {
//         res.status(404).json({
//             status: 'fail',
//             message: error.message
//         })
//     }
// }
// exports.UserLogin = async function (req, res) {
//     try {
//         const { mo } = req.body
//         if (!/^[0-9]{10}$/.test(mo)) {
//             return res.status(400).json({ message: 'Invalid mobile number format' });
//         }
//         if (!mo) { return res.status(202).json({ message: 'please enter this mobile number' }) }

//         let user = await APP.findOne({ mo })

//          if (!user) {
//             const otp = Math.floor(100000 + Math.random() * 900000)
//             const expiresAt = new Date(Date.now() + 2 * 60000); // 2 min

//         //  user = await APP.create({ mo, otp, expiresAt, isVerified: false });

//             return res.status(200).json({
//                 status: "otp_sent",
//                 message: "New user created, OTP sent for verification",
//                 otp 
//             });
//         }
//          if (!user.isVerified) {
//             return res.status(200).json({
//                 status: "otp_pending",
//                 message: "Please verify OTP first"
//             });
//         }

//         const token = jwt.sign({ id: user._id }, 'verifyotp');
//         res.status(200).json({
//             status: "success",
//             message: "user login",
//              token
//         });
//     } catch (error) {
//         res.status(404).json({
//             status: 'fail',
//             message: error.message
//         })
//     }
// }
exports.UserLogin = async (req, res) => {
    try {
        const { mo } = req.body;

        if (!mo) return res.status(400).json({ message: "Enter mobile number" });
        if (!/^[0-9]{10}$/.test(mo)) {
            return res.status(400).json({ message: "Invalid mobile format" });
        }
        const user = await APP.findOne({ mo });
        const existingOtp = await Otp.findOne({ mo });


        if (existingOtp && existingOtp.expiresAt > new Date()) {
            return res.status(429).json({
                message: "Please wait two minutes before requesting a new OTP"
            });
        }


        if (user && user.isVerified) {
            const token = jwt.sign({ id: user._id }, "verifyotp", { expiresIn: "1d" });
            return res.status(200).json({
                status: "success",
                message: "Login successful",
                token
            });
        }


        const otp = 111111
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        await Otp.deleteOne({ mo }); // clear old if any
        await Otp.create({ mo, otp, expiresAt });

        if (!user) {
            // new user
            return res.status(200).json({
                status: "otp_sent",
                message: "OTP generated for new user",
                otp //  for testing only
            });
        } else {
            // existing but not verified
            return res.status(200).json({
                status: "otp_resent",
                message: "OTP resent, please verify",
                otp
            });
        }

    } catch (err) {
        res.status(500).json({ status: "fail", message: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { mo, otp } = req.body;

        if (!mo || !otp) return res.status(400).json({ message: "Mobile and OTP required" });

        const otpDoc = await Otp.findOne({ mo });
        if (!otpDoc) return res.status(400).json({ message: "OTP not found" });

        if (otpDoc.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (otpDoc.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

        //  OTP success → create/verify user
        let user = await APP.findOne({ mo });

        if (!user) {
            user = new APP({ mo, isVerified: true });
            await user.save();
        } else {
            user.isVerified = true;
            await user.save();
        }

        // clear OTP
        await Otp.deleteOne({ mo });

        // generate token
        const token = jwt.sign({ id: user._id }, "verifyotp", { expiresIn: "1h" });

        return res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            token
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// exports.verifyOtp = async function (req, res) {
//     try {
//         const { mo, otp } = req.body;
//         if (!mo || !otp) {
//             return res.status(400).json({ message: 'Mobile number and OTP are required' });
//         }
//         const user = await APP.findOne({ mo });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         if (!user.otp || !user.expiresAt) {
//             return res.status(400).json({ message: 'OTP not generated' });
//         }
//         if (user.otp !== otp) {
//             return res.status(400).json({ message: 'Invalid OTP' });
//         }
//         if (user.expiresAt < new Date()) {
//             return res.status(400).json({ message: 'OTP expired' });
//         }
//         // jwttionally clear OTP after successful verification
//         user.isVerified = true
//         user.otp = null;
//         user.expiresAt = null;
//         await user.save();
//         const token = jwt.sign({ id: mo }, 'verifyotp')
//         console.log(token);

//         res.status(200).json({ message: 'OTP verified successfully', token: token });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// }

exports.UserFind = async function (req, res) {
    try {
        let Userfind = await APP.find()
        if (!Userfind) { return res.status(402).json({ message: 'Not found' }) }
        res.status(202).json({
            status: 'success',
            message: 'user find ',
            data: Userfind
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}
exports.UserFindOne = async function (req, res) {
    try {
        const userId = req.user._id
        let Userfindone = await APP.findOne(userId)

        //    console.log("findone == > ",Userfindone);
        if (!Userfindone) { throw new Error("Not found") }
        res.status(201).json({
            status: 'success',
            message: 'user find ',
            data: Userfindone
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.messages
        })
    }
}
exports.UserUpadate = async function (req, res) {
    try {
        const userId = req.user.id
        console.log("Id ==> ", userId);

        const { mo } = req.body
        console.log("mo ==> ", mo);

        let Userupadate = await APP.findByIdAndUpdate(userId, { mo }, { new: true })
        console.log("Update ==> ", Userupadate);

        if (!Userupadate) { throw new Error("Not update") }
        res.status(202).json({
            status: 'success',
            message: 'user update successful',
            data: Userupadate
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}
exports.UserDelete = async function (req, res) {
    try {
        const userId = req.user._id
        let Userdelete = await APP.findByIdAndDelete(userId)
        if (!Userdelete) { throw new Error("User Not Found") }
        res.status(202).json({
            status: 'success',
            message: 'user delete successfull'
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}
// exports.gereteotp = async function (req, res) {
//     try {
//         const mo = req.body.mo
//         if (!/^[0-9]{10}$/.test(mo)) {
//             return res.status(400).json({ message: 'Invalid mobile number format' });
//         }
//         if (!mo) { return res.status(402).json({ message: 'please enter your valid mobile number' }) }

//         const otp = Math.floor(100000 + Math.random() * 900000);
//         // console.log(otp);
//         let now = new Date()
//         let expiresAt = new Date(now.getTime() + 2 * 60000);
//         let user = await APP.findOne({ mo: mo })
//         if (user) {
//             if (user.expiresAt && user.expiresAt > now) {
//                 return res.status(500).json({ message: 'Please wait two minutes before requesting a new OTP' })
//             }
//             user.otp = otp;
//             user.createdAt = now;
//             user.expiresAt = expiresAt;

//             await user.save();
//         }
//         else {
//             user = new APP({ mo, otp, createdAt: now, expiresAt });
//             await user.save();
//         }
//         // if (user.APP) {
//         //     await exports.sendOtpAPP(user.APP, otp);
//         // }

//         console.log(`OTP for ${mo}: ${otp}`);
//         res.status(200).json({
//             message: "OTP sent successfully",
//             mo,
//             expiresAt,
//             otp
//         });

//     } catch (error) {
//         console.log('otp generate error : ', error);
//         res.status(500).json({
//             message: 'server error',
//             error: error.message
//         })
//     }
// }