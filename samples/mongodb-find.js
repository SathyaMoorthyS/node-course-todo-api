const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db)=> {

    if(err){
        return console.log('Unable to connect to MongoDB server.')
    }
    console.log('Connected to MongoDB server.')


    // db.collection('Todos').find({_id: new ObjectID('5a23f171e25a088e650957fb')}).toArray().then( (docs)=> {
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todo '+err)
    // })

    // db.collection('Todos').find({}).count().then( (count)=> {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todo '+err)
    // })

    db.collection('Users').find({name:'SathyaMoorthy S'}).count().then( (count)=> {
        console.log(`Todos count should be 2: ${count}`);
    }, (err) => {
        console.log('Unable to fetch todo '+err)
    })

    //db.close();
})