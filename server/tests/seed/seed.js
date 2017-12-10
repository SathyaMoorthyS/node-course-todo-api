const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/Todo')
const {User} = require('./../../models/User')

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users =[
    {
        '_id': userOneId,
        'email':'test1@test.com',
        'password':'test123',
        'tokens':[
            {
            'token' : jwt.sign({_id:userOneId, access:'auth'},'user').toString(),
            'access':'auth'
            }            
        ]
    },
    {
        '_id': userTwoId,
        'email':'test2@test.com',
        'password':'test123',
        'tokens':[
            {
            'token' : jwt.sign({_id:userTwoId, access:'auth'},'user').toString(),
            'access':'auth'
            }            
        ]
    }
]

const todos = [
    {
        _id: new ObjectID(),
        text:'Learn Mocha'
    },
    {
        _id: new ObjectID(),
        text:'Learn Supertest',
        completed: true,
        completedAt: 111
    }
]

const populateUsers = (done)=>{         
    User.remove({}).then(()=> {        
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(()=> done());
}

const populateTodos = (done)=>{
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos)
    }).then(()=> done());
}




module.exports = {todos, populateTodos, users, populateUsers}