//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

//console.log(new ObjectID())

var user = {
    name: 'Sathya',
    age: 34
}

var {name} = user;
console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db)=> {

    if(err){
        return console.log('Unable to connect to MongoDB server.')
    }
    console.log('Connected to MongoDB server.')

    // db.collection('Todos').insertOne({
    //     text: 'Learn RoboMongo',
    //     completed: false
    // }, (err, result)=> {
    //     if(err){
    //         return console.log('Unable to insert todo.', err)
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // })

    // db.collection('Users').insertOne({
    //     //_id:new ObjectID(),
    //     name: 'SathyaMoorthy S',
    //     age: 34,
    //     location: 'Chennai'
    // }, (err, result)=> {
    //     if(err){
    //         return console.log('Unable to insert user.', err)
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // })

    db.close();
})