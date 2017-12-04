var mongoose = require('mongoose');
var db = require('../models/db');
var ShipmentSchema = new mongoose.Schema({
	username:String,
	tablename:String,
	table:String
});

var ShipmentModel = db.model('Shipment', ShipmentSchema);

function Shipment(username,tablename,table) {
	this.username = username;
	this.tablename= tablename;
	this.table = table;
};

module.exports = Shipment;

Shipment.prototype.save = function(callback){
	var shipment = {
		username:this.username,
		tablename:this.tablename,
		table:this.table
	}

	ShipmentModel.create(shipment, function(err,data){
		if(err){
			return callback(err);
		}
		callback(null,data);
	});
} 

Shipment.remove = function(query,callback){
	ShipmentModel.remove(query,function(err){
		if(err){
	  		return callback(err)
	  	}
	  	callback(null);
	});
}

Shipment.fine= function(query,callback){

	ShipmentModel.find(query, function (err, doc){
		if(err){
			return callback(err)
		}else{
			callback(null,doc);
		}
	});
};

Shipment.findOne= function(query,callback){

	ShipmentModel.findOne(query, function (err, doc){
		if(err){
			return callback(err)
		}else{
			callback(null,doc);
		}
	});
};

Shipment.update= function(query,uptable,callback){

	ShipmentModel.update(query,uptable,function(err,data){

		if(err){
			return callback(err)
		}else{
			return callback(null,data)
		}
	});

};

