require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');
var {authenticate} = require('./middleware/authenticate');


const port = process.env.PORT ;

var app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        createdBy: req.user._id
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (error)=>{
        res.status(400).send(error);
    })
})

app.get('/todos', authenticate, (req, res)=> {
    Todo.find({
        createdBy: req.user._id
    }).then( (todos)=>{
        res.send({
            todos
        })
    }, (err)=>{
        res.status(400).send(err);
    })
})
app.get('/todos/:id', authenticate, (req, res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        //console.log('Id is not valid')
        return res.status(404).send({})
    }
    Todo.findOne({
        _id:id,
        createdBy: req.user._id
    }).then((todo)=>{

        if(!todo){
            return res.status(404).send({})
        }
        res.status(200).send({todo})
        
    }).catch((e)=> {
        res.status(400).send({})
    })

})

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({})
    }

    Todo.findOneAndRemove({
        _id: id,
        createdBy: req.user._id
    }).then( (todo) =>{

        if(!todo){
            return res.status(404).send({});
        }

        res.status(200).send({todo});
    } , (err) => {

        res.status(400).send({})

    })
})

app.patch('/todos/:id', authenticate, (req, res) => {

    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({})
    }

    var body = _.pick(req.body, ['text', 'completed']);

    if(_.isBoolean(body.completed) && body.completed){        
        body.completedAt= new Date().getTime();
    }else{
        body.completed=false;
        body.completedAt= null
    }

    Todo.findOneAndUpdate({
        _id:id,
        createdBy: req.user._id
        }, {$set: body}, {new: true}).then( (todo) => {

        if(!todo){
            return res.status(404).send();
        }

        res.status(200).send({todo});

    }).catch((e)=>{
        res.status(400).send();
    })

})


//POST /users

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then((user)=>{       
        return user.generateAuthToken();
    }, (error)=>{
        res.status(400).send(error);
    }).then( (token) => {
        res.header('x-auth', token).send(user);
    }).catch((e)=> res.status(400).send(e));
})

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
})

app.post('/users/login', (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);    
    if(body.email && body.password)
    {
        var email = body.email;
        var password = body.password;
        
        User.findByCredentials(email, password).then( (user)=>{            
            return user.generateAuthToken().then( (token)=> {                
                res.header('x-auth', token).send(user);
            })
        }).catch( (e) => {            
            res.status(400).send();
        })
        
    }
})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(()=> {
        res.status(200).send()
    },() => {
        res.status(400).send()
    })
})

app.listen(port, ()=> {
    console.log(`Started TodoApp on port ${port}`);
})

module.exports={app};
