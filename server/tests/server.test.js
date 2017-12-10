const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/Todo')
const {User} = require('./../models/User');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', ()=> {
    it('should create a new todo', (done)=>{

        console.log('>>should create a new todo')
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

describe('GET /todos/:id', ()=>{
    it('should return a todo doc', (done)=>{

        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);

    })

    it('should return a 404 if Id not found in db', (done)=>{

        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done);

    })

    it('should return a 404 if Id is not valid', (done)=>{
         request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    })
})

describe('DELETE /todos/:id', ()=>{

    it('should remove a todo', (done)=>{
        var hexId=todos[0]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res)=>{
            if(err){
                return done(err);
            }

            Todo.findById(hexId).then((todo)=>{
                
                expect(todo).toNotExist();
                done();
            }).catch(e => done(e))

        });
    })

    it('should return 404 if todo not found', (done)=>{

        request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done);

    })

    it('should return 404 if objectid is invalid', (done)=>{

        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);

    })


})

describe('PATCH /todos/:id', ()=> {

    it('should update a todo', (done)=> {

        var id = todos[0]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .send({text:'Update Learn Mocha',completed: true})
        .expect(200)
        .expect((res)=> {
            expect(res.body.todo.text).toBe('Update Learn Mocha')
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);

    })

    it('should clear completedAt when completed is set to false', (done)=>{

        var id = todos[1]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .send({text:'Update Learn Supertest',completed: false})
        .expect(200)
        .expect((res)=> {
            expect(res.body.todo.text).toBe('Update Learn Supertest')
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist()
        })
        .end(done);

    })

})

describe('GET /users/me', ()=>{

    it('should return user if authenticated', (done)=> {

        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString())
            expect(res.body.email).toBe(users[0].email)
            
        })
        .end(done); 
    })

    it('should return 401 if not authenticated', (done)=>{

        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res)=>{
            expect(res.body).toEqual({});
        })
        .end(done); 

    })

})

describe('POST /users', ()=> {
   

    it('should return a user', (done)=> {
         var email = 'test3@test.com';
         var password = 'password123';
        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email)            
        })
        .end( (err, res)=>{
            if(err){
                return done(err)
            }

            User.findOne({email}).then( (user)=>{
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch(e=> done(e));
        })
    })

    it('should return a validation error', (done)=>{
         var email = 'test3';
        var password = 'pass';
        request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .end(done);
    })

    it('should return 400 if email already exits', (done)=>{
        var email = users[0].email;
        var password = 'password123';
        request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .end(done);
    })

})