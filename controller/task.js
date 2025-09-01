// Get all tasks for the logged-in user

const { set } = require('mongoose');
const TASK = require('../model/task');
const { json } = require('express');
const APP = require('../model/app');
// exports.getMyTasks = async function(req, res) {
//     try {
//         const userId = req.user._id;
//         console.log("UserId ==> "+ userId);

//         const tasks = await TASK.find({ userId });
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
exports.getMyTasks = async function (req, res) {
    try {
        const userId = req.user._id;
        console.log('userId ==> ', userId);


        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const skip = (page - 1) * limit;
        console.log("Skip", skip);
        const search = req.query.q ? req.query.q.trim() : '';
        console.log("Search ==> ", search);
        const priority = req.query.priority
        console.log("Userpriority ==> ", priority);

        let query = { userId };
        console.log(" query ==> ", query);
        if (search) {
            console.log(query.task = { $regex: search, $options: 'i' });
        }
        if (priority) {
            query.priority = { $regex: priority, $options: 'i' }
        }
        const totalTasks = await TASK.countDocuments(query);
        const tasks = await TASK.find(query)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: 'success',
            page,
            limit,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            countOnPage: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
}
exports.CreateTask = async function (req, res) {
    try {
        const userId = req.user._id
        // console.log("userid ==> ",userId);

        const requiredFields = ["task", "priority", "date", "time"];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `Please fill required ${field}` });
            }
        }
        // console.log("hello ==> " + userId);
        const savedTask = await TASK.create({ ...req.body, userId });
        // console.log("Task ==> " + savedTask);

        const currentuser = await APP.findById(userId)
        // console.log("current ==> ",currentuser);

        currentuser.Usertask.push(savedTask._id)
        await currentuser.save();

        // console.log("users ==> ", currentuser);

        res.status(201).json({
            status: 'success',
            message: 'Task created successfully',
            data: savedTask
        });
    } catch (error) {
        // if (error.code === 11000) {
        //     return res.status(400).json({
        //         status: 'fail',
        //         message: 'You already have this task pending. Please complete it before adding again.'
        //     });
        // }
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}
exports.Findtask = async function (req, res) {
    try {
        const Findtask = await TASK.find()
        if (!Findtask) { return res.status(402).json({ message: 'Task Not Found ' }) }
        res.status(202).json({
            status: 'success',
            message: 'Task create ',
            data: Findtask
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
}
exports.FindOnetask = async function (req, res) {
    try {
        const Findonetask = await TASK.findById(req.params.id).populate('User_task')
        console.log(Findonetask);

        if (!Findonetask) { return res.status(402).json({ message: 'Task Not Found ' }) }
        res.status(202).json({
            status: 'success',
            message: 'Task create ',
            data: Findonetask
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
}
// Update a task by ID
exports.UpdateTask = async function (req, res) {
    try {
  
        const { taskId } = req.params
        console.log("taskId ==> ",taskId);
        
         const Updatetask = await TASK.findByIdAndUpdate(
            _id : taskId,  userId        // 🔑 ekaj id pass karvi
            { ...req.body }, // update fields
            { new: true}
        );
        console.log("update ==> " , Updatetask);
        
        if (!Updatetask) { return res.status(404).json({ message: 'task not update' }) }
        res.status(200).json({
            status: 'success',
            message: 'Task updated ',
            data: Updatetask
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
}
// Delete a task by ID
exports.DeleteTask = async function (req, res) {
    try {
        const Deletetask = await TASK.findByIdAndDelete(req.params.id)
        if (!Deletetask) { return res.status(402).json({ message: 'task is not found ' }) }
        res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
}
exports.addNote = async function (req, res) {
    try {
        const { taskId, text } = req.body
        console.log(taskId, text);
        if (!taskId || !text) {
            return res.status(400).json({ message: "taskId and text require" });
        }
        // Find task and push note
        const updatedTask = await TASK.findByIdAndUpdate(
            taskId,
            { $push: { notes: { text } } },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({
            status: 'success',
            message: 'Note Create',
            data: updatedTask
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        });
    }
}
exports.markTaskStatus = async function (req, res) {
    try {
        // Accept status from body, query, or default to 'Done'
        const status = req.body.status || req.query.status || 'pending';
        console.log(status);

        if (!['pending', 'Done', 'Undone'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use "Done" or "Undone".' });
        }
        const task = await TASK.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ message: 'Task Not Found' });
        }
        res.status(200).json({
            status: 'success',
            message: `Task marked as ${status}`,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}
// exports.markAsDone = async function (req, res) {
//     try {
//         const task = await TASK.findByIdAndUpdate(
//             req.params.id,
//             { $set: { status: 'Done' } },
//             { new: true }
//         );
//         if (!task) { return res.status(400).json({ message: 'Task Not Found' }) }
//         res.status(202).json({
//             status: 'suceess',
//             message: 'Taks is Done',
//             data: task
//         })
//     } catch (error) {
//         res.status(404).json({
//             status: 'fail',
//             message: error.message
//         });
//     }
// }
// exports.markAsUnDone = async function (req, res) {
//     try {
//         const task = await TASK.findByIdAndUpdate(
//             req.params.id,
//             { $set: { status: 'Undone' } },
//             { new: true }
//         );
//         if (!task) { return res.status(402).json({ message: 'Task Not Found' }) }
//         res.status(202).json({
//             status: 'successs',
//             message: 'Task Undone ',
//             data: task
//         })
//     } catch (error) {
//         res.status(404).json({
//             status: 'fail',
//             message: error.message
//         });
//     }
// }