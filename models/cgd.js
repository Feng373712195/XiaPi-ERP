var mongoose = require('mongoose');
var db = require('../models/db')
var cgdSchema = new mongoose.Schema({
	Time: String,
	Arr: [String],
	CgS: [String],
	PicS:[String],
	Lacks:[String],
	Prices:[String]
});

var cgdModel = db.model('cgd', cgdSchema);



function Cgd(Time, Arr,CgS,PicS,Lacks,Prices) {
	this.Time = Time;
	this.Arr = Arr;
	this.CgS = CgS;
	this.PicS = PicS;
	this.Lacks = Lacks;
	this.Prices = Prices;
};

module.exports = Cgd;

Cgd.prototype.save = function(callback){

	var cgd = {
		Time : this.Time,
		Arr :this.Arr,
		CgS:this.CgS,
		PicS : this.PicS,
		Lacks:this.Lacks,
		Prices:this.Prices
	}

	cgdModel.create(cgd, function(err,data){
		if(err){
			return callback(err);
		}
		callback(null,data);
	});
};

Cgd.findOnd = function(Time,callback){
	var FindTime = {Time:Time}
	cgdModel.findOne(FindTime, function (err, doc){
	  	if(err){
			return callback(err)
		}else{
			return callback(null,doc)
		}
	});
};

Cgd.QJsearch = function(TimeArr,callback){

	cgdModel.find({ "Time": { "$in": TimeArr }},function(err,docs){
		if(err){
			return callback(err)
		}else{
			return callback(null,docs);
		}
	})
}

Cgd.findAll = function(callback){
	cgdModel.find({},null,{sort:{_id:1}},function (err, docs){
	  	if(err){
			return callback(err)
		}else{
			return callback(null,docs)
		}
	});
};

Cgd.updata =function(query,update,callback){
	var queryTime = {Time:query};
	cgdModel.update(queryTime,update,function(err,doc){
		if(err){
			return callback(err)
		}else{
			return callback(null,doc)
		}
	});
	
};

Cgd.remove = function(Time,callback){
	var removeTime = {Time:Time};
	cgdModel.remove(removeTime,function(err){
		if(err){
	  		return callback(err)
	  	}
	  	callback(null);
	});
}



// Cgd.findAll = function(callback){
// 	cgdModel.find({},null,function (err, docs){
// 	  	if(err){
// 			return callback(err)
// 		}else{
// 			return callback(null,docs)
// 		}
// 	});
// };