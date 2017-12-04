const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db)=> {

    if(err){
        return console.log('Unable to connect to MongoDB server.')
    }
    console.log('Connected to MongoDB server.')

    // db.collection('Todos').deleteMany({text:'Update Profile in jb search portal'}).then((result)=>{
    //     console.log(result)
    // }, (err)=> {
    //     console.log(err)
    // })

    // db.collection('Todos').deleteOne({text:'Pay LIC'}).then((result)=>{
    //     console.log(result)
    // }, (err)=> {
    //     console.log(err)
    // })

    // db.collection('Todos').findOneAndDelete({text:'watch tv'}).then((result)=>{
    //     console.log(result)
    // }, (err)=> {
    //     console.log(err)
    // })

    //db.collection('Users').deleteMany({name:'Kamal H'});

    db.collection('Users').findOneAndDelete({_id:new ObjectID('5a2549bd2404afaf86aa5b5c')}).then( (result)=>{
        console.log(result);
    }, (err)=> {
        console.log(err);
    })

    //db.close();
})