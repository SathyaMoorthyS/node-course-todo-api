const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db)=> {

    if(err){
        return console.log('Unable to connect to MongoDB server.')
    }
    console.log('Connected to MongoDB server.')

    // db.collection('Todos').findOneAndUpdate(
    // {
    //     _id: new ObjectID('5a24f8962404afaf86aa5b52')
    // },
    // {
    //     $set: {
    //         completed: true
    //     }
    // },
    // {
    //     returnOriginal: false
    // }).then( (result) => {
    //     console.log(result);
    // })
    db.collection('Users').findOneAndUpdate(
    {
        _id: new ObjectID('5a254b462404afaf86aa5b5d')
    },
    {
        $set: {
            name: 'SathyaMoorthy Sabapathy'
        },
        $inc: {
            age: -2
        }
    },
    {
        returnOriginal: false
    }).then( (result) => {
        console.log(result);
    })

    //db.close();
})