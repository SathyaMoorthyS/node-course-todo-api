const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');


const port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (error)=>{
        res.status(400).send(error);
    })
})

app.get('/todos', (req, res)=> {
    Todo.find().then( (todos)=>{
        res.send({
            todos
        })
    }, (err)=>{
        res.status(400).send(err);
    })
})
app.get('/todos/:id', (req, res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        //console.log('Id is not valid')
        return res.status(404).send({})
    }
    Todo.findById(id).then((todo)=>{

        if(!todo){
            return res.status(404).send({})
        }
        res.status(200).send({todo})
        
    }).catch((e)=> {
        res.status(400).send({})
    })

})

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({})
    }

    Todo.findByIdAndRemove(id).then( (todo) =>{

        if(!todo){
            return res.status(404).send({});
        }

        res.status(200).send({todo});
    } , (err) => {

        res.status(400).send({})

    })
})

app.patch('/todos/:id', (req, res) => {

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

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then( (todo) => {

        if(!todo){
            return res.status(404).send();
        }

        res.status(200).send({todo});

    }).catch((e)=>{
        res.status(400).send();
    })

})


app.listen(port, ()=> {
    console.log(`Started TodoApp on port ${port}`);
})

module.exports={app};
