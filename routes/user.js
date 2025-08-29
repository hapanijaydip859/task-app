const UserController = require('../controller/app')
const UserMiddleware = require('../middleware/secure')
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/my-tasks', UserMiddleware.sequre, UserController.getMyTasks);
// router.post('/Create' , UserController.UserSignup)
router.post('/Login' , UserController.UserLogin)
// router.post('/send-otp', UserController.gereteotp)
router.post('/verify-otp', UserController.verifyOtp)
router.get('/Find' ,  UserController.UserFind)
router.get('/findOne/:id' ,UserController.UserFindOne)
router.patch('/Update/:id',UserController.UserUpadate)
router.delete('/Delete/:id' , UserController.UserDelete)
module.exports = router;
