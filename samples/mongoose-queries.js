const {mongoose} = require('./../server/db/mongoose')
const {Todo} = require('./../server/models/Todo')
const {User} = require('./../server/models/User')
const {ObjectID} = require('mongodb');

const id='5a2962f6d126ff1430cb9f7d';

const userId='5a256eb46997371af466c317';

if(!ObjectID.isValid(id)){
    console.log('Id not valid')
}

Todo.find({
    //'completed': false
    _id: id
}).then((todos)=>{
    console.log('Todos',todos)
})

Todo.findOne({
    _id: id
}).then((todo)=>{
    if(!todo){
        return console.log('Id not found')
    }
    console.log('Todo',todo)
})

Todo.findById(id).then((todo)=>{

    if(!todo){
        return console.log('Id not found')
    }
    console.log('Todo by id',todo)
}).catch((e)=> console.log(e))


User.findById(userId).then((user)=>{

    if(!user){
        return console.log('User not found')
    }
    console.log('User by id',user)
}).catch((e)=> console.log(e))