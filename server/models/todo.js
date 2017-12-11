var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text : {
        type: String,
        required : true,
        trim: true,
        minLength : 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

module.exports = { Todo };