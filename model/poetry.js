var mongodb = require('./db');
function Poetry(poetry) {
	this.No = poetry.No;
	this.theme = poetry.theme;
	this.poe = poetry.poe;
	this.img = poetry.img;
	this.fontcolor = poetry.fontcolor;
	this.x = poetry.x;
	this.y = poetry.y;
	this.fontFamily = poetry.fontFamily;
}

module.exports = Poetry;

Poetry.prototype.save = function(callback) {
	var poetry = {
		No: this.No,
		theme: this.theme,
		poe:this.poe,
		img:this.img,
		fontcolor:this.fontcolor,
		x:this.x ,
		y:this.y,
		fontFamily:this.fontFamily
	}

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('counters',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//id自增长
			collection.findAndModify(
				{'catagory': poetry.theme},
				[['id','desc']],
				{$inc:{'id':1}},
				{new: true },
				function(err,counters){
					if(err) {
						mongodb.close();
						return callback(err);
					}
					poetry.No = counters.value.id;
					db.collection('poetry',function(err,collection){
						if (err) {
							mongodb.close();
							return callback(err);
						}
						collection.insert(poetry,{
							safe:true
						},function(err,poetries){
							mongodb.close();
							if (err) {
								return callback(err);
							}
							return callback(null,poetries);
						})
					})
				}
				)
		})
		
	})
}

Poetry.getAll = function(catagory,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('poetry',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({'theme':catagory}).sort({id:1}).toArray(function(err,poetries){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null,poetries);
			})
		})
	})
}