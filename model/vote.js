var mongodb = require('./db');

function Vote(vote){
	this.item = vote.item;
	this.itemID = vote.itemID;
	this.count = vote.count;
	this.date = vote.date;
}

module.exports = Vote;

/*存入一条数据*/
Vote.prototype.save =function(cb){
	var partyEntry = {
		item: this.item,
		itemID: this.itemID,
		count: this.count,
		date: this.date
	}

	mongodb.open(function(err,db){
		if (err) {
			return cb(err);
		}

		db.collection('vote',function(er,collection){
			if (err) {
				mongodb.close();
				return cb(err);
			}
			collection.insert(vote,{
				safe:true
			},function(err,votes){
				mongodb.close();
				if (err) {
					return cb(err);
				}
				return cb(null,votes);
			})
		})
	})
}

/*获取某个活动的投票信息*/
PartyEntry.getPartyEntries(function(itemId,cb){
	mongodb.open(function(err,db){
		if (err) {
			return cb(er);
		}
		db.collection('vote',function(err,collection){
			if (err) {
				mongodb.close();
				return cb(err);
			}
			collection.find({itemID: itemId}).toArray(function(err,votes){
				mongodb.close();
				if (err) {
					return cb(err);
				}
				return cb(null,votes);
			})
		})
	})
})