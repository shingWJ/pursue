var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server,
	MongoClient=require('mongodb').MongoClient;

//module.exports = new Db(settings.db, new Server(settings.host,settings.port),{safe:true});

// module.exports = new MongoClient(new Server(settings.host,settings.port,{
//                              socketOptions:{connectTimeoutMS:500},
//                               poolSize:5,
//                               auto_reconnect:true
//                           },{
//                               numberOfRetries:3,
//                             retryMiliSeconds:500
//                          })).db(settings.db);
module.exports = function(cb){
	MongoClient.connect('mongodb://' + settings.host + ':' + settings.port + '/' + settings.db,function(err,database){
		cb(err,database);
	});
}