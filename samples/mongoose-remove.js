const {mongoose} = require('./../server/db/mongoose')
const {Todo} = require('./../server/models/Todo')
const {User} = require('./../server/models/User')
const {ObjectID} = require('mongodb');

const id='5a2ba3739c712515184914f5';




//findOneAndRemove
//findByIdAndRemove

Todo.findByIdAndRemove(id).then( (todo)=>{
    console.log('Todo ',todo)
}, (err)=>{
     console.log('Error',err)
})

Todo.findOneAndRemove({_id:id}).then( (todo)=>{
    console.log('Todo ',todo)
}, (err)=>{
     console.log('Error',err)
})



// Todo.remove({}).then( (res)=>{
//     console.log('Result',res)
// }, (err)=>{
//      console.log('Error',err)
// })