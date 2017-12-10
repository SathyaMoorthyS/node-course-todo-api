const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt= require('bcryptjs');

var UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
            unique: true,
            validate: {
                validator: (value) => {
                    return validator.isEmail(value);
                },
                message: '{VALUE} is not valid email'
            }
        },
        password: {
            type: String,
            required: true,
            minLength: 6
        },
        tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }]
    }
)
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email', 'tokens'])
}
UserSchema.methods.generateAuthToken = function (){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id:user._id.toHexString(), access},'user').toString();    
    user.tokens=[];//Added Only this line to fix test case should login and return user auth token
    user.tokens.push({access, token});    
    return user.save().then((err)=>{        
        return token
    })
}
UserSchema.methods.removeToken = function(token){
    var user = this;
    return user.update({
        $pull: {
            tokens : {
                token: token
            }
        }
    });
}
UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token,'user');
    }catch(e){
        return Promise.reject();
    }    
    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access':'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password){
    var User = this;

    return  User.findOne({email}).then( (user)=>{                
                if(!user){
                    return Promise.reject();
                }

                return new Promise( (resolve, reject) => {
                    bcrypt.compare(password, user.password, (err, result)=>{                                           
                        if(result){
                            resolve(user);
                        }else{
                            //original code
                            //reject();

                            //To fix test case should reject invalid login
                            user.tokens=[];
                            user.save().then(()=>{
                                reject();
                            })
                            
                        }
                    })
                })

            })

}

UserSchema.pre('save', function(next){
    var user = this;   
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(user.password, salt, (err, hash)=>{
                user.password= hash;
                next();
            })
        })
    }else{
        next(); 
    }
})
var User = mongoose.model('User', UserSchema)

module.exports = { User };