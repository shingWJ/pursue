var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;
var CONSTANT_PAGE_NUM = 5;

function Article(article){
	this.topic = article.topic;
	this.content = article.content;
	this.date = article.date;
	this.author = article.author;
	this.title = article.title;
	this.isLike = article.isLike;
	this.commentID = article.commentID;
	this.comments = article.comments;
}

module.exports = Article;

/*存入一条数据*/
Article.prototype.save = function(callback){
	var article = {
		topic: this.topic,
		title: this.title,
		content: this.content,
		date: this.date,
		author: this.author,
		isLike: this.isLike,
		commentID: this.commentID,
		comments: this.comments
	}
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}
		
		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			collection.insert(article,{
				safe: true
			},function(err,articles){
				db.close();
				if (err)
					return callback(err);
				callback(null,articles);
			})
		})
	})
}

/*获取所有文章*/
Article.getAll = function(name,callback){
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return	callback(err);
			}

			collection.find({author: name}).sort({date:-1}).toArray(function(err,articles){
				db.close();
				if (err) {
					return callback(err);
				}

				callback(null,articles);
			})
		})
	})
}

/*根据ID获取数据*/
Article.getArticleById = function(id,callback) {
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			console.log('ObjectId("'+id+'")');
			//var ObjectId = 'ObjectId("'+id+'")';
			collection.findOne({_id:ObjectID(id)},function(err,articles){
				db.close();
				if (err) {
					return callback(err);
				}

				callback(null,articles);
			})
		})
	})
}

/**
* 获取topic的数据
*/
Article.getHappiness = function(topic,callback) {
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			collection.find({topic:topic}).sort({date:-1}).toArray(function(err,articles){
				db.close();
				if (err) {
					console.log(err);
					return callback(err);
				}
				return callback(null,articles);
			})
		})
	})
}

Article.getHappinessByPage = function(topic,page,callback) {
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			var skipNum = parseInt(page) * CONSTANT_PAGE_NUM;
			console.log(skipNum);
			console.log(CONSTANT_PAGE_NUM);
			var query = collection.find({topic:topic}).sort({date:-1});
			query.skip(skipNum).limit(CONSTANT_PAGE_NUM);
			query.toArray(function(err,articles){
				db.close();
				if (err) {
					return callback(err);
				}
				callback(null,articles);
			})
		})
	})
}

Article.updateIsLike = function(commentID,isLike,callback) {
	mongodb(function(err,db) {
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			} 

			collection.update({commentID:commentID},{$set:{isLike: isLike}},{safe:true},function(err,result){
				db.close();
				if (err) {
					return callback(err);
				}
				return callback(null,result);
			})
		})
	})
}

Article.addComments = function(commentID,comments,callback) {
	mongodb(function(err,db) {
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			} 

			collection.update({commentID:commentID},{$set:{comments: comments}},{safe:true},function(err,result){
				db.close();
				if (err) {
					return callback(err);
				}
				return callback(null,result);
			})
		})
	})
}


/*根据ID获取数据*/
Article.getArticleByCommentId = function(id,callback) {
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('articles',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			collection.findOne({commentID:id},function(err,articles){
				db.close();
				if (err) {
					return callback(err);
				}

				callback(null,articles);
			})
		})
	})
}

