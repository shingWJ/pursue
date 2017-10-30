var mongodb = require('./db');

function Personnel(personnel) {
	this.competitionID = personnel.competitionID;
	this.competitionName = personnel.competitionName;
	this.isJoin = personnel.isJoin;
	this.userName = personnel.userName;
	this.remark = personnel.remark;
	this.date = personnel.date;
}

module.exports = Personnel;

/*存储活动人员*/
Personnel.prototype.save =function(callback){
	var personnel ={
		competitionID: this.competitionID,
		competitionName: this.competitionName,
		isJoin : this.isJoin,
		userName : this.userName,
		remark : this.remark,
		date : this.date
	}

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}

		db.collection('personnels',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(personnel,{
				safe : true
			},function(err,result){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,result[0]);
			})
		})
	})
}

/*获取某项目的人员*/
Personnel.getThisCompetition = function(competitionID,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('personnels',function(err,collection){
			if (err) {
				mongodb.close();
			}
			collection.find({competitionID:competitionID}).sort({date:1}).toArray(function(err,result){
				mongodb.close();
				if (err) {
					return	callback(err);
				}
				return callback(null,result);
			})
		})
	})
}