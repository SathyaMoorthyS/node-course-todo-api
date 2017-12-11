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
        
        var todoText="From POST Tescase";

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(1);
        })
        .end(done)
    })
})

describe('GET /todos/:id', ()=>{
    it('should return a todo doc', (done)=>{

        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);

    })

    it('should not return a todo doc', (done)=>{

        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)        
        .end(done);

    })

    it('should return a 404 if Id not found in db', (done)=>{

        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);

    })

    it('should return a 404 if Id is not valid', (done)=>{
         request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    })
})

describe('DELETE /todos/:id', ()=>{

    it('should remove a todo', (done)=>{
        var hexId=todos[0]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
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

    it('should not remove a todo', (done)=>{
        var hexId=todos[0]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)        
        .end((err, res)=>{
            if(err){
                return done(err);
            }

            Todo.findById(hexId).then((todo)=>{
                
                expect(todo).toExist();
                done();
            }).catch(e => done(e))

        });
    })

    it('should return 404 if todo not found', (done)=>{

        request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);

    })

    it('should return 404 if objectid is invalid', (done)=>{

        request(app)
        .delete('/todos/123')
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);

    })


})

describe('PATCH /todos/:id', ()=> {

    it('should update a todo', (done)=> {

        var id = todos[0]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text:'Update Learn Mocha',completed: true})
        .expect(200)
        .expect((res)=> {
            expect(res.body.todo.text).toBe('Update Learn Mocha')
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);

    })

    it('should not update a todo', (done)=> {

        var id = todos[0]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text:'Update Learn Mocha',completed: true})
        .expect(404)        
        .end(done);

    })

    it('should clear completedAt when completed is set to false', (done)=>{

        var id = todos[1]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[1].tokens[0].token)
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

describe('POST /users/login', ()=>{

    it('should login and return user auth token', (done)=>{

        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect( (res) => {            
            expect(res.headers['x-auth']).toExist();          
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            User.findById(users[1]._id).then( (user)=> {                
                expect(user.tokens[1]).toInclude({
                    access:'auth',
                    token: res.headers['x-auth']
                });
                
                done();
            }).catch((e)=> done(e));

        })

    })

    it('should reject invalid login', (done)=>{
        
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password+'1'
        })
        .expect(400)
        .expect( (res) => {
            expect(res.headers['x-auth']).toNotExist();          
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            User.findById(users[1]._id).then( (user)=> {                
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((e)=> done(e));

        })

    })

})

describe('DELETE /users/me/token', ()=>{

    
    it('should delete the token', (done)=>{
        
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.headers['x-auth']).toNotExist();          
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }

            User.findById(users[0]._id).then( (user)=> {                
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e)=> done(e));

        })
    })

    it('should return 401', (done)=>{
        
        request(app)
        .delete('/users/me/token')        
        .expect(401)
        .expect((res)=>{
            expect(res.header['x-auth']).toNotExist()
        })
        .end(done);

    })

});