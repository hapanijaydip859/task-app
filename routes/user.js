const UserController = require('../controller/app')
const UserMiddleware = require('../middleware/secure')
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/my-tasks', UserMiddleware.sequre, UserController.getMyTasks);
// router.post('/Create' , UserController.UserSignup)
router.post('/Login', UserController.UserLogin)
// router.post('/send-otp', UserController.gereteotp)
router.post('/verify-otp', UserController.verifyOtp)
// router.get('/Find', UserMiddleware.sequre, UserController.UserFind)
// router.get('/findOne', UserMiddleware.sequre, UserController.UserFindOne)
router.patch('/Update', UserMiddleware.sequre, UserController.UserUpadate)
router.delete('/Delete', UserMiddleware.sequre, UserController.UserDelete)
module.exports = router;
