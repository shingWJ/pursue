var mongodb = require('./db');

function PartyEntry(partyEntry){
	this.name = partyEntry.name;
	this.phoneNO = partyEntry.phoneNO;
	this.partyID = partyEntry.partyID;
	this.entryCount = partyEntry.entryCount;
	this.placeAdvice = partyEntry.placeAdvice;
	this.date = partyEntry.date;
	this.suitableTime = partyEntry.suitableTime;
	this.tasteFavor = partyEntry.tasteFavor;
}

module.exports = PartyEntry;

/*存入一条数据*/
PartyEntry.prototype.save =function(cb){
	var partyEntry = {
		name: this.name,
		phoneNO: this.phoneNO,
		partyID: this.partyID,
		entryCount: this.entryCount,
		placeAdvice: this.placeAdvice,
		date: this.date,
		suitableTime:this.suitableTime,
		tasteFavor:this.tasteFavor
	}

	mongodb.open(function(err,db){
		if (err) {
			return cb(err);
		}

		db.collection('partyEntry',function(er,collection){
			if (err) {
				mongodb.close();
				return cb(err);
			}
			collection.insert(partyEntry,{
				safe:true
			},function(err,partyEntries){
				mongodb.close();
				if (err) {
					return cb(err);
				}
				return cb(null,partyEntries);
			})
		})
	})
}

/*获取某个活动的报名信息*/
PartyEntry.getPartyEntries = function(partyID,cb){
	mongodb.open(function(err,db){
		if (err) {
			return cb(er);
		}
		db.collection('partyEntry',function(err,collection){
			if (err) {
				mongodb.close();
				return cb(err);
			}
			collection.find({partyID: partyID}).toArray(function(err,partyEntries){
				mongodb.close();
				if (err) {
					return cb(err);
				}
				return cb(null,partyEntries);
			})
		})
	})
}