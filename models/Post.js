var mongoose = require('mongoose'); 
var db = require('../models/db')
var cpkSchema = new mongoose.Schema({code:String,pic:[String],price:String,supplier:String,address:String,website:String,emarks:String,title:String,createtime:String});

var cpkModel = db.model('cpk',cpkSchema);


function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var week;
	switch (date.getDay()){
	 case 1: week="星期一"; break;
	 case 2: week="星期二"; break;
	 case 3: week="星期三"; break;
	 case 4: week="星期四"; break;
	 case 5: week="星期五"; break;
	 case 6: week="星期六"; break;
	 default: week="星期天";
	}
    var currentdate = year + seperator1 + month + seperator1 + strDate + " "+week;
    return currentdate;
};


function Post(code,pic,price,supplier,address,website,emarks,title){
	this.code = code;
	this.pic = pic;
	this.price = price;
	this.supplier = supplier;
	this.address = address;
	this.website =website;
	this.emarks = emarks;
	this.title = title;
	this.createtime = getNowFormatDate();
};

module.exports = Post;

Post.prototype.from = function(callback){

	var post = {
		code:this.code,
		pic:this.pic,
		price:this.price,
		supplier:this.supplier,
		address:this.address,
		website:this.website,
		emarks:this.emarks,
		title:this.title,
		createtime:this.createtime
	}

	cpkModel.create(post, function(err,data){
		if(err){
			return callback(err);
		}
		callback(null,'保存数据成功');
	});
}

Post.prototype.update = function(UpdataCode,callback){
	
	var codeobj = {code:UpdataCode};

	var update = {
		code:this.code,
		pic:this.pic,
		price:this.price,
		supplier:this.supplier,
		address:this.address,
		website:this.website,
		emarks:this.emarks,
		title:this.title
	}

	cpkModel.update(codeobj,update,{ multi: false }, function(err){

		if(err){
			return callback(err)
		}else{
			return callback(null)
		}
	});
}

Post.data = function(callback){

	cpkModel.find({},null,function(err,users){
		if(err){
			return callback(err);
		}
		 callback(users);
	});

}

Post.getOne = function(code,callback){

	var codeobj = {code:code};
	cpkModel.findOne(codeobj, function (err, doc){
	  	if(err){
			return callback(err)
		}else{
			return callback(null,doc)
		}
	});
};

Post.remove = function(code,callback){
	var codeobj = {code:code};
	cpkModel.remove(codeobj,function(err){
		if(err){
	  		return callback(err)
	  	}
	  	callback(null);
	});
}

Post.search = function(query,callback){

	cpkModel.find(query,function(err,docs){
		if(err){
	  		return callback(err)
	  	}
	  	callback(null,docs);
	});
	
};

Post.Addremarks =function(query,remarks,callback){
	
	cpkModel.update(query,remarks,{ multi: true }, function(err,doc){
		if(err){
			return callback(err)
		}else{
			return callback(null,doc)
		}
	});
};

Post.findArr = function(Arr,callback){

	cpkModel.find({ "code": { "$in": Arr }},function(err,docs){
		if(err){
			return callback(err)
		}else{
			return callback(null,docs);
		}
	})
}

Post.sortPic = function(code,Arr,callback){
	var codeobj = {code:code};
	var picArr = {pic:Arr}

	cpkModel.update(codeobj,picArr,{ multi: true }, function(err,doc){
		if(err){
			return callback(err)
		}else{
			return callback(null,doc)
		}
	});
}