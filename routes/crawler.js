//var http = reqire('http');
var path = require('path');
var request  = require('request');
var cheerio = require('cheerio');

var Crawler = function(options){
	
}

Crawler.getInfo = function(url,callback){
	request(url,function(err,response,body){
		if (!err && response.statusCode == 200) {
			//console.log(body);
			var imgSrc = acquireData(body);
			console.log('options:'+JSON.stringify(imgSrc));
			return callback(null,imgSrc);
		} else {
			console.log('123'+ response.statusCode);
			return callback(err);
		}
	})
}


var acquireData = function(data){
	var $ = cheerio.load(data);
	var img = $('.candidates .first-image');
	console.log('img:' + img.toString());
	var imgSrc = img.attr('data-src');
	console.log('src:'+imgSrc);
	var del = $('.promote-default del');
	var price = del.text();
	var addressDiv = $('div#yui_3_16_0_1_1467871783401_2454.biz-item.field-group');
	var address = addressDiv.attr('title');
	console.log('address:'+addressDiv.toString());
	return {
		imgSrc: imgSrc,
		price: price,
		address:address
	};
}

/*获取文件名*/
var parseFileName = function(address){
	var fileName = path.baseName(address);
	return fileName;
}

/*下载*/
var downloadImg = function(uri,fileName,callback){
	request.head(uri,function(err,res,body){
		if (err) {
			console.log('err:' + err);
			return false;
		}
		console.log('res:' + res);
		request(uri),pipe(fs.createWriteStream('images/'+fileName).on('close',callback));
	});
}

module.exports = Crawler;