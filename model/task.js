const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const noteSchema = new Schema({
    text: {
        type: String,
        required: [true, 'Note text is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const todoSchema = new Schema({
    task: {
        type: String,
        required: [true, 'please enter your task'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: [true, 'please select priority']
    },
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'app'
    },
    date: {
        type: Date,
        required: [true, 'please pick a date']
    },
    time: {
        type: String, // Store as "HH:mm"
        required: [true, 'please pick a time']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
         enum: ["pending", "done", "Undone"],
        default: "pending",
    },
  
    notes:[noteSchema]
},
{
    timestamps:true    
});
// todoSchema.index(
//     // { task: 1, priority: 1, date: 1, time: 1 }
//     // { unique: true }
// );

const TASK = mongoose.model('task', todoSchema)
module.exports = TASK