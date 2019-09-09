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

	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('poetry',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}
			//id自增长
			// collection.findAndModify(
			// 	{'catagory': poetry.theme},
			// 	[['id','desc']],
			// 	{$inc:{'id':1}},
			// 	{new: true },
			// 	function(err,counters){
			// 		if(err) {
			// 			db.close();
			// 			return callback(err);
			// 		}
			// 		console.log("");
			// 		if (counters.value == null) {
			// 			poetry.No = "0";
			// 		} else {
			// 			poetry.No = counters.value.id;
			// 		}
			// 		db.collection('poetry',function(err,collection){
			// 			if (err) {
			// 				db.close();
			// 				return callback(err);
			// 			}
			// 			collection.insert(poetry,{
			// 				safe:true
			// 			},function(err,poetries){
			// 				db.close();
			// 				if (err) {
			// 					return callback(err);
			// 				}
			// 				return callback(null,poetries);
			// 			})
			// 		})
			// 	}
			// 	)

			collection.find({theme:poetry.theme}).toArray(function(err,poetryEnt){
				console.log('111');
				if (err) {
					console.log(err);
					return callback(err);
				}

				if (poetryEnt && poetryEnt.length > 0) {
					poetry.No = poetryEnt.length;
				} else {
					poetry.No = 0;
				}
				
				db.collection('poetry',function(err,collection){
					if (err) {
					console.log(err);
					return callback(err);
					}
					collection.insert(poetry,{
						safe:true
					},function(err,poetries){
						db.close();
						if (err) {
							console.log(err);
							return callback(err);
						}

						return callback(null,poetries);
					})
				})
			})

		})
		
	})
}

Poetry.getAll = function(catagory,callback){
	mongodb(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('poetry',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}
			collection.find({'theme':catagory}).sort({id:1}).toArray(function(err,poetries){
				db.close();
				if (err) {
					return callback(err);
				}
				return callback(null,poetries);
			})
		})
	})
}