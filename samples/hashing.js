const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken');

var jwtData={
    id: 506
}

var token = jwt.sign(jwtData,'hash');
console.log('Token '+token);

var decoded = jwt.verify(token, 'hash');
console.log('Decoded '+JSON.stringify(decoded));


var message = "A Message";
var hash = SHA256(message).toString();
console.log("Message ",message)
console.log("Hash ", hash)

var data={
    id: 1
}
var token ={
    data,
    hash: SHA256(JSON.stringify(data)+'simple').toString()
}

//token.data.id=2;
//token.data.hash=SHA256(JSON.stringify(token.data)).toString();

var resultHash = SHA256(JSON.stringify(token.data)+'simple').toString();
if(resultHash === token.hash){
    console.log("Data not changed")
}else{
    console.log("Data changed. Threat")
}