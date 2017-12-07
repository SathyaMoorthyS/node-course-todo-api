const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/Todo')

const todos = [
    {
        text:'Learn Mocha'
    },
    {
        text:'Learn Supertest'
    }
]

beforeEach((done)=> {
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos)
    }).then(()=> done());
})

describe('POST /todos', ()=> {
    it('should create a new todo', (done)=>{

        var todoText="From POST Tescase";

        request(app)
        .post('/todos')
        .send({'text':todoText})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(todoText);
        })
        .end((err,res)=>{
            if(err){
                return done(err)
            }

            Todo.find({'text':todoText}).then((todos)=>{
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(todoText);
                done();
            }).catch(e=> done(e))
        })

    })

    it('should not create a todo', (done)=>{

        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err,res)=>{
            if(err){
                return done(err);
            }

            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2);
                done();
            }).catch(err=>done(err));

        })

    });

})

describe('GET /todos', ()=>{
    it('should return all todos', (done)=>{

        request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(2);
        })
        .end(done)
    })
})