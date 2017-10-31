var mongodb = require('./db');

function Comment(comment){
	this.content = comment.content;
	this.date = comment.date;
	this.commentID = comment.commentID;
}

module.exports = Comment;

/*存入一条数据*/
Comment.prototype.save = function(callback){
	var comment = {
		content: this.content,
		date: this.date,
		commentID: this.commentID
	}
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}
		
		db.collection('comment',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}

			collection.insert(comment,{
				safe: true
			},function(err,comments){
				db.close();
				if (err)
					return callback(err);
				callback(null,comments);
			})
		})
	})
}