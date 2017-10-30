var mongodb = require('./db');
var CONSTANT_PAGE_NUM = 30;
var ObjectID = require('mongodb').ObjectID;

function Emotion(emotion){
	this.category = emotion.category;
	this.content = emotion.content;
	this.images = emotion.images;
	this.date = emotion.date;
	this.name = emotion.name;
	this.openness = emotion.openness;
}

module.exports = Emotion;

/**
* 存入一条数据
*/
Emotion.prototype.save = function(callback){

	var emotion = {
		category : this.category,
		content : this.content,
		images : this.images,
		date : this.date,
		name : this.name,
		openness: this.openness
	}

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.insert(emotion,{
				safe:true
			},function(err,emotion){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,emotion[0]);
			})
		})
	})
}

/**
* 取得该用户所有数据
*/
Emotion.getMyAll = function(name,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.find({name:name}).sort({date:-1}).toArray(function(err,emotions,pages){
				console.log('111');
				mongodb.close();
				if (err) {
					console.log(err);
					return callback(err);
				}
				return callback(null,emotions,Math.ceil(emotions.length/CONSTANT_PAGE_NUM));
			})
		})
	})
}

/**
* 删除该用户的某条数据
*/
Emotion.removeThis = function(content,name,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			console.log({content:content,
				name : name});
			collection.remove({
				content:content,
				name : name
			},{safe:true},function(err,result){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				console.log(result);
				callback(null,result);
			})
		})
	})
}

/**
* 分页取得数据
*/
Emotion.pagination = function(name,page,callback){

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		
		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			console.log(page);
			var skipNum = parseInt(page) * CONSTANT_PAGE_NUM;
			console.log(skipNum);
			console.log(CONSTANT_PAGE_NUM);
			var query = collection.find({name:name}).sort({date:-1});
			query.skip(skipNum).limit(CONSTANT_PAGE_NUM);
			query.toArray(function(err,emotions){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,emotions);
			})
		})
	})
}

/*更新单个字段*/
Emotion.updateField = function(id,upConten,callback){

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.update({_id:ObjectID(id)}, {$set:{openness: upConten}},{safe:true},function(err,result){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null,result);
			})
		})
	})
}

/*获取所有开放*/
Emotion.getAllOpenned = function(callback){

	mongodb.open(function(err,db){
		if(err) {
			return	callback(err);
		}

		db.collection('emotions',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.find({openness:1}).sort({date:-1}).toArray(function(err,result){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null,result);
			})
		})
	})
}