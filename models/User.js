var mongoose = require('mongoose');
var db = require('../models/db')
var UserSchema = new mongoose.Schema({
	username:String,
	password:String,
	letter:String
});

var UserModel = db.model('User', UserSchema);

function User(username,password,letter) {
	this.username = username;
	this.password= password;
	this.letter = letter;
};

module.exports = User;

User.prototype.save = function(callback){
	var User = {
		username:this.username,
		password:this.password,
		letter:this.letter
	}

	UserModel.create(User, function(err,data){
		if(err){
			return callback(err);
		}
		callback(null,data);
	});
} 

User.find = function(query,callback){

	UserModel.findOne({username:query}, function (err, doc){
		if(err){
			return callback(err)
		}else{
			callback(null,doc);
		}
	});
};

User.findAll = function(callback){
	UserModel.find({},function(err,docs){
		if(err){
			return callback(err)
		}else{
			callback(null,docs);
		}
	});
}



