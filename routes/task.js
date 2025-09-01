
// Route to get all tasks for the logged-in user
let UserController = require('../controller/task');
const UserMiddleware = require('../middleware/secure')
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


// Route to create a new task
router.get('/my-tasks', UserMiddleware.sequre, UserController.getMyTasks);
router.post('/create' ,UserMiddleware.sequre,UserController.CreateTask)
// router.get('/Find', UserController.Findtask)
// router.get('/FindOne/:id' , UserController.FindOnetask)
router.patch('/Update/:taskId', UserMiddleware.sequre, UserController.UpdateTask)
router.delete('/Delete/:taskId', UserMiddleware.sequre,UserController.DeleteTask)
router.post('/tasks/add-note', UserMiddleware.sequre,UserController.addNote)
// router.patch('/tasks/marks-As-Done/:id' , UserController.markAsDone)
// router.patch('/tasks/mark-Undone/:id', UserController.markAsUnDone)
router.patch('/mark-status/:id', UserMiddleware.sequre,UserController.markTaskStatus)

module.exports = router;
