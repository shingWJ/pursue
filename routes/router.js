var express = require('express');
var crypto = require('crypto');
var User = require('../model/user')
var Emotion = require('../model/emotion');
var Personnel = require('../model/personnel');
var Article = require('../model/article');
var Comment = require('../model/comment');
var Poetry = require('../model/poetry');
var formidable = require('formidable');
var fs = require('fs');
var xml2js = require('xml2js');
var https = require("https");
var router = express.Router();
var Device = require('../routes/deviceType');
var imageProcess = require('../routes/imageProcess');
var multipart = require('connect-multiparty');
var crawler = require('./crawler');
var PartyEntry = require('../model/partyEntry');
var beHappy = require('./beHappy');

/*CONSTANT*/
var CONSTANT_TITLE = "浮萍网";
var CONSTANT_TEMP_FOLDER = "public/temp/";
var CONSTANT_FILE_FOLDER = "public/files/";
var CONSTANT_LOG_ERROR = 'err';
var CONSTANT_LOG_SUCCESS = 'success';
var APPID = "wx2af43ef63416efa1";
var APPSECRET = "0d3c96fb8bfcd8b0b4a00007a4ab55b8";

var M_Token = "fuzhongxuezi";

String.prototype.replaceAll = function(str1,str2){
	return this.replace(new RegExp(str1,"gm"),str2);
}

/* GET home page. */
module.exports = function(app, accessLog,errorLog) {

	/*微信公众号对接*/
	app.get('/wechat', checkToken);
	app.get('/wechat', function(req, res) {
		var echostr = req.query.echostr;
		// res.render('wechat',{
		// 	title: CONSTANT_TITLE
		// })
		writeLog("echostr=" + echostr);
		res.end(echostr);
		console.log("Confirm and send echo back");
	})

	/*微信用户文本信息解析*/
	app.post('/wechat', function(req, res) {
		var bodyData = '';
		req.on('data', function(chunk) {
			bodyData += chunk;
		})
		req.on('end', function() {
			xml2js.parseString(bodyData, {
				explicitArray: false,
				ignoreAttrs: true
			}, function(err, result) {
				res.send(JSON.stringify(result));
				var content = result.xml.Content;
				if (!content) {
					writeLog('content is null,openId is' + result.xml.FromUserName);
					return;
				}
				var contentSp = content.split('_');
				var new_personnel = new Personnel({
					competitionID: '0',
					competitionName: "浮山男子篮球夏季联赛",
					isJoin: contentSp[0] == '是' ? '1' : '0',
					userName: contentSp[1] ? contentSp[1] : '',
					remark: contentSp[2] ? contentSp[2] : '',
					date: new Date()
				});

				new_personnel.save(function(err, result) {
					if (err) {
						writeLog('personnel save err:' + err.toString());
					}
				})
					//writeLog("req=" + JSON.stringify(result));
					//var openId = result.xml.FromUserName;
					//getAccessToken(openId,getWechatUserInfo);

				//writeLog("req11=" + access_token+"id="+openid);
				//getWechatUserInfo(access_token,openId);
			});
			// json=xml2json.toJson(bodyData);
			// res.send(JSON.stringify(json));
			// writeLog("req=" + json.xml.Content);
		})
	})

	/*活动统计页面*/
	app.get('/competition', function(req, res) {
		Personnel.getThisCompetition('0', function(err, personnels) {
			if (err) {
				writeLog('personnel gotten err:' + err.toString());
			}
			res.render('competition', {
				title: CONSTANT_TITLE,
				personnels: personnels,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	})

	/*自己懂的*/
	app.get('/dream', function(req, res) {
		res.render('dream', {});
	})

	app.get('/behappy',checkHappyNotLogin);
	app.get('/behappy', function(req, res) {
		res.render('behappylogin', {
						title: CONSTANT_TITLE,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
	})

	app.post('/behappy', function(req, res) {
		var md5 = crypto.createHash('md5');
		var name = req.body.account;
		var password = md5.update(req.body.password).digest('hex');

		User.get(name, function(err, user) {
			if (err) {
				req.flash('error', err);
				writeLog(CONSTANT_LOG_ERROR,'login post error: ' + err);
				return res.redirect('/behappy');
			}

			if (!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/behappy');
			}

			if (password != user.password) {
				req.flash('error', '密码错误!');
				return res.redirect('/behappy');
			}

			req.session.happyUser = user;
			console.log('登录成功');
			writeLog(CONSTANT_LOG_SUCCESS,'behappy login: userName=' +user.name);
			//req.flash('success','登陆成功!');

			res.redirect('/happyContent');
		})
	})

	app.get('/behappy',checkHappyLogin);
	app.get('/happyContent',function(req,res){
		Article.getHappiness('happiness',function(err,articles){
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'happyContents error: ' + err);
				req.flash('err',err);
				return;
			}

			writeLog(CONSTANT_LOG_SUCCESS,'happyContents success: ' + req.session.user.name);
			res.render('happyContent', {
						title: CONSTANT_TITLE,
						happyContents: articles,
						user: req.session.happyUser,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
		})
	})

	app.get('/updateIsLike/:commentID/:isLike',function(req,res){
		var commentID = req.params.commentID;
		var isLike = req.params.isLike;
		Article.updateIsLike(commentID,isLike,function(err,result) {
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'happyContents error: ' + err);
				req.flash('err',err);
				return;
			}
			res.end();
		})
	})

	app.get('/addComment/:commentID/:content',function(req,res){
		var commentID = req.params.commentID;
		var content = req.params.content;
		// var newComment = new Comment({
		// 	commentID: commentID,
		// 	content: content,
		// 	date: new Date()
		// });
		// newComment.save(function(err,comments){
		// 	if (err) {
		// 		console.log(err);
		// 		writeLog(CONSTANT_LOG_ERROR,'articlePublish error: ' + err);
		// 		req.flash('err', err);
		// 		//return;
		// 	}
		// 	console.log(comments.toString());
		// 	res.end();
		// })
		Article.getArticleByCommentId(commentID,function(err,article){
			if (err) {
						// 		console.log(err);
		 		writeLog(CONSTANT_LOG_ERROR,'articlePublish error: ' + err);
		 		req.flash('err', err);
			}
			console.log(JSON.stringify(article));
			console.log(JSON.stringify(req.session));
			var comment = {
				commentID: commentID,
				content: content,
				user: req.session.happyUser.name,
				date: new Date()
			}
			article.comments.push(comment);

			Article.addComments(commentID,article.comments,function(err,articles){
				if (err) {
						// 		console.log(err);
		 			writeLog(CONSTANT_LOG_ERROR,'articlePublish error: ' + err);
		 			req.flash('err', err);
				}
				console.log(articles.toString());
				res.end();
			})
		})
	})

	/*获取当前页的数据*/
	app.get('/getPageData',function(req,res){
		var pageNum = parseInt(req.query.page) -1;
		console.log(pageNum);
		writeLog(CONSTANT_LOG_SUCCESS,'getPageData: page=' + pageNum + "user: " + pageNum);
		Emotion.pagination(req.session.user.name, pageNum, function(err, emotions) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'getPageData: page=' + pageNum + "error: " + err);
				return res.redirect('/');
			}
			emotions_get = emotions;
			var elemets = new Array();
				//date转型
				for (var i=0;i< emotions.length;i++) {
					var date =  emotions[i].date.getFullYear()+'/'+(emotions[i].date.getMonth()+1)+'/'+emotions[i].date.getDate()+' '+ (emotions[i].date.getHours()>9?emotions[i].date.getHours():(0+emotions[i].date.getHours()))+':'+(emotions[i].date.getMinutes()>9?emotions[i].date.getMinutes():(0+emotions[i].date.getMinutes()));
					elemets.push({
						content: emotions[i].content,
						images: emotions[i].images,
						date: date,
						name: emotions[i].name
					});
				}
				writeLog(CONSTANT_LOG_SUCCESS,'getPageData: page=' + pageNum + "get data successfully");
				res.send(elemets);
			})
	})
	/*首页（判断是否登录）*/
	app.get('/', checkLogin);
	app.get('/', function(req, res) {
		var emotions_get;
		//获取所有心绪
		// Emotion.getMyAll(req.session.user.name,function(err,emotions){
		// 	if (err) {
		// 		req.flash('error',err);
		// 		console.log(err);
		// 		return res.redirect('/');
		// 	}

		// 	emotions_get = emotions;
		// 	res.render('index',{
		// 	title: CONSTANT_TITLE,
		// 	emotions:emotions_get,
		// 	success: req.flash('success').toString(),
		// 	error: req.flash('error').toString()
		// 	});
		// })
		var newDevice = new Device();
		var deviceType = Device.getType(req);
		if (deviceType == 'pc') {
			//TODO 分页读取显示
			Emotion.pagination(req.session.user.name, 0, function(err, emotions) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					writeLog(CONSTANT_LOG_ERROR,'index paging error: ' + err);
					return res.redirect('/');
				}
				emotions_get = emotions;
				Emotion.getMyAll(req.session.user.name,function(err,emotions,pages){
					if (err) {
						req.flash('error', err);
						console.log(err);
						writeLog(CONSTANT_LOG_ERROR,'index get page error: ' + err);
						return res.redirect('/');
					}
					writeLog(CONSTANT_LOG_SUCCESS,'index success: ' + req.session.user.name);
					res.render('index', {
						allOpenned: false,
						title: CONSTANT_TITLE,
						emotions: emotions,
						pages:pages,
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				})
				
			})
		} else {
			// Emotion.pagination(req.session.user.name, 0, function(err, emotions) {
			// 	if (err) {
			// 		req.flash('error', err);
			// 		console.log(err);
			// 		writeLog(CONSTANT_LOG_ERROR,'index get page error: ' + err);
			// 		return res.redirect('/');
			// 	}
			// 	emotions_get = emotions;
			// 	writeLog(CONSTANT_LOG_SUCCESS,'index success: ' + req.session.user.name);
			// 	res.render('mobileIndex', {
			// 		title: CONSTANT_TITLE,
			// 		emotions: emotions_get,
			// 		user: req.session.user,
			// 		success: req.flash('success').toString(),
			// 		error: req.flash('error').toString()
			// 	});
			// })
			res.render('mobilePost', {
				allOpenned: false,
				title: CONSTANT_TITLE,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		}
	});

	/*首页*/
	app.get('/index', checkLogin);
	app.get('/index', function(req, res) {
		console.log('tou');
		console.log(req.session.user);
		var emotions_get;
		var newDevice = new Device();
		var deviceType = Device.getType(req);
		if (deviceType == 'pc') {
			//TODO 分页读取显示
			Emotion.pagination(req.session.user.name, 0, function(err, emotions) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					writeLog(CONSTANT_LOG_ERROR,'index get page error: ' + err);
					return res.redirect('/');
				}
				emotions_get = emotions;
				Emotion.getMyAll(req.session.user.name,function(err,emotions,pages){
					if (err) {
						req.flash('error', err);
						console.log(err);
						writeLog(CONSTANT_LOG_ERROR,'index get page error: ' + err);
						return res.redirect('/');
					}

					writeLog(CONSTANT_LOG_SUCCESS,'index success: ' + req.session.user.name);
					res.render('index', {
						allOpenned: false,
						title: CONSTANT_TITLE,
						emotions: emotions,
						pages:pages,
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				})
				
			})
		} else {
			Emotion.pagination(req.session.user.name, 0, function(err, emotions) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					writeLog(CONSTANT_LOG_ERROR,'index get page error: ' + err);
					return res.redirect('/');
				}
				emotions_get = emotions;
				writeLog(CONSTANT_LOG_SUCCESS,'index success: ' + req.session.user.name);
				res.render('mobileIndex', {
					allOpenned: false,
					title: CONSTANT_TITLE,
					emotions: emotions_get,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		}
	});

	app.get('/mobilePost', checkLogin);
	app.get('/mobilePost', function(req, res) {
		writeLog(CONSTANT_LOG_SUCCESS,'mobilePost success: ' + req.session.user.name);
		res.render('mobilePost', {
			title: CONSTANT_TITLE,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})

	/*首页发表表单提交*/
	app.post('/index', function(req, res) {
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		form.uploadDir = CONSTANT_TEMP_FOLDER;
		form.keepExtensions = true;
		form.parse(req, function(err, fields, files) {
			if (err) {
				req.flash('err', err);
				writeLog(CONSTANT_LOG_ERROR,'index post error: ' + err);
				res.render('index', {
					title: CONSTANT_TITLE
				});
				return;
			}

			//从temp文件夹读取文件
			fs.readdir(CONSTANT_TEMP_FOLDER, function(err, fileName) {
				if (err) {
					req.flash('err', err);
					writeLog(CONSTANT_LOG_ERROR,'index post error: ' + err);
					res.render('index', {
						title: CONSTANT_TITLE
					});
					return;
				}
				var images = new Array();
				var image;
				
				if (files.pics && files.pics.size > 0) {
					if (fileName.length > 0) {
						for (var i = 0; i < fileName.length; i++) {
							var name = fileName[i];
							var fileType = name.split('.')[1];
							if (fileType != 'jpg' && fileType != 'png' && fileType!=null) {
								req.flash('err', "请上传图片");
								writeLog(CONSTANT_LOG_ERROR,'index post error: ' + err);
								res.render('index', {
									title: CONSTANT_TITLE
								});
								return;
							}
							if (fileType == 'jpg' || fileType == 'png') {
								var date = new Date();
								var avatarName = req.session.user.name + getTimeStr(date) + '.' + fileType;
								image = avatarName;
								images.push(image);
								var newPath = CONSTANT_FILE_FOLDER + avatarName;
								console.log("path" + newPath);
								fs.renameSync(CONSTANT_TEMP_FOLDER + name, newPath, function(err) {
									if (err) {
										req.flash('err', err);
										writeLog(CONSTANT_LOG_ERROR,'index post error: ' + err);
										res.render('index', {
											title: CONSTANT_TITLE
										});
										return;
									}
								});
							}
						}
					}
				}
				//删除temp文件夹下的所有文件
				fs.readdir(CONSTANT_TEMP_FOLDER, function(err, fileName) {
					fileName.forEach(function(name) {
						fs.unlinkSync(CONSTANT_TEMP_FOLDER + name);
					})
				});
				var emotion = fields.emotion;
				console.log(emotion);
				console.log(new Date());
				console.log(images.length == 0 ? null : images.join(','));
				console.log(req.session.user.name);
				var newEmotion = new Emotion({
					category: 'love',
					content: emotion,
					images: images.length == 0 ? null : images.join(','),
					date: new Date(),
					name: req.session.user.name,
					openness: 0
				});

				newEmotion.save(function(err, emotion) {
					if (err) {
						req.flash('error', err);
						writeLog(CONSTANT_LOG_ERROR,'index post error: ' + err);
						console.log(err);
						return res.redirect('/');
					}
					res.redirect('/index');
				})
			});

		});
	})

	/*登录界面*/
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		var newDevice = new Device();
		var deviceType = Device.getType(req);
		//判断设备是移动端还是桌面端
		if (deviceType == 'pc') {
			res.render('login', {
				title: CONSTANT_TITLE,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		} else {
			res.render('mobileLogin', {
				title: CONSTANT_TITLE,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		}
	});

	/*用户登录*/
	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5');
		var name = req.body.account;
		var password = md5.update(req.body.password).digest('hex');

		User.get(name, function(err, user) {
			if (err) {
				req.flash('error', err);
				writeLog(CONSTANT_LOG_ERROR,'login post error: ' + err);
				return res.redirect('/login');
			}

			if (!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/login');
			}

			if (password != user.password) {
				req.flash('error', '密码错误!');
				return res.redirect('/login');
			}

			req.session.user = user;
			console.log('登录成功');
			//req.flash('success','登陆成功!');

			res.redirect('/');
		})
	})

	/*注册界面*/
	app.get('/regist', checkNotLogin);
	app.get('/regist', function(req, res) {
		res.render('regist', {
			title: CONSTANT_TITLE,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})

	/*注册*/
	app.post('/regist', checkNotLogin);
	app.post('/regist', function(req, res) {
		var name = req.body.account;
		var password = req.body.password;
		var password_re = req.body.password_re;

		if (!name) {
			req.flash('error', '用户名为空，请输入用户名');
			res.redirect('/regist');
		}

		if (!password) {
			req.flash('error', '密码为空，请输入密码');
			res.redirect('/regist');
		}

		if (!password_re) {
			req.flash('error', '重复密码为空，请输入重复密码');
			res.redirect('/regist');
		}


		if (password != password_re) {
			req.flash('error', '两次输入的密码不一致!');
			res.redirect('/regist');
		}

		var md5 = crypto.createHash('md5'),
		password = md5.update(password).digest('hex');

		var newUser = new User({
			name: name,
			password: password
		});

		User.get(newUser.name, function(err, user) {
			if (err) {
				res.flash('error', err);
				writeLog(CONSTANT_LOG_ERROR,'regist post error: ' + err);
				return res.redirect('/regist');
			}

			if (user) {
				req.flash('error', '用户已存在!');
				return res.redirect('/regist');
			}

			newUser.save(function(err, user) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					writeLog(CONSTANT_LOG_ERROR,'regist post error: user save ' + err);
					return res.redirect('/regist');
				}

				req.session.user = newUser;
				req.flash('success', '注册成功!');
				res.redirect('/');
			});
		})

	})

	/*删除发表*/
	app.post('/index/remove', function(req, res) {
		console.log('remove');
		Emotion.removeThis(req.body.content, req.session.user.name, function(err, result) {
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'Emotion remove post error: ' + err);
				req.flash('err', err);
			}
			res.redirect('/');
		})
	})

	/*退出登录*/
	app.get('/logout', function(req, res) {
		req.session.user = null;
		//console.log('logout');
		console.log('已退出');
		writeLog(CONSTANT_LOG_SUCCESS,'logout : ' + req.session.user.name);
		//req.flash('success','已退出');
		res.redirect('/login');
	})

	/*移动端聊天*/
	app.get('/mobilechat', checkLogin);
	app.get('/mobilechat', function(req, res) {
		writeLog(CONSTANT_LOG_SUCCESS,'mobilechat success: ' + req.session.user.name);
		res.render('mobileChat', {
			title: CONSTANT_TITLE,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})

	/*长文发表页*/
	app.get('/articlePublish', checkLogin);
	app.get('/articlePublish', function(req, res) {
		writeLog(CONSTANT_LOG_SUCCESS,'articlePublish success: ' + req.session.user.name);
		res.render('articlePublish',{
			title: CONSTANT_TITLE,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	});

	/*长文发表*/
	app.post('/articlePublish',function(req,res){
		console.log(JSON.stringify(req.body));
		var content = req.body.content;
		var title = req.body.subTitle;
		var topic = req.body.topic;
		console.log(topic);
		var newArticle = new Article({
			isLike: 0,
			commentID: createID(),
			topic: topic,
			title: title,
			content: content,
			author: req.session.user.name,
			date: new Date(),
			comments: []
		});
		newArticle.save(function(err,article){
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'articlePublish error: ' + err);
				req.flash('err', err);
				//return;
			}  

			res.redirect('/articleList')
		})
	})

	/*长文页*/
	app.get('/articleList', checkLogin);
	app.get('/articleList', function(req, res) {
		var name = req.session.user.name;
		Article.getAll(name,function(err,articles){
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'articleList error: ' + err);
				req.flash('err',err);
				return;
			}

			writeLog(CONSTANT_LOG_SUCCESS,'articleList success: ' + req.session.user.name);
			res.render('articleList',{
				title: CONSTANT_TITLE,
				articles: articles
			})
		})
	});

	/*长文详情页*/
	app.get('/article/:id', checkLogin);
	app.get('/article/:id', function(req, res) {
		var id = req.params.id;
		console.log(id);
		Article.getArticleById(id,function(err,articles){
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'articleList error: ' + err);
				req.flash('err',err);
				return;
			}
			console.log(articles);
			writeLog(CONSTANT_LOG_SUCCESS,'article success: ' + req.session.user.name);
			res.render('article',{
				title: CONSTANT_TITLE,
				article: articles
			})
		})
	});

	/*log解析显示*/
	app.get('/showLogs',function(req,res){
		var accessLog ;
		var errorLog;
		fs.readFile('access.log',function(err,data){
			if(err){
				writeLog(CONSTANT_LOG_ERROR,'accessLogs error: ' + err);
				req.flash('err',err);
				return;
			}
			accessLog = data.toString().replaceAll('\n','');
			fs.readFile('error.log',function(err,errLogs){
				if(err){
					writeLog(CONSTANT_LOG_ERROR,'errLogs error: ' + err);
					req.flash('err',err);
					return;
				}
				errorLog = errLogs.toString().replaceAll('\n','');
				res.render('showLogs',{
					title: 'Log',
					success: req.flash('success').toString(),
					error: req.flash('error').toString(),
					accessLog: accessLog,
					errorLog: errorLog
				});
			})
		});
	})

	/*活动概况*/
	app.get('/party',function(req,res){
		PartyEntry.getPartyEntries(2,function(err,partyEntries){
			if (err) {
				req.flash('error', err);
				writeLog(CONSTANT_LOG_ERROR,'partyEntry post error: ' + err);
				console.log(err);
				res.render('party',{
					title: '老钱组第二次集体聚会',
					partyEntries: null,
					allcounts:0
				})
			}
			var allcounts = 0;
			partyEntries.map(function(item){
				allcounts += parseInt(item.entryCount,0); 
			})
			res.render('party',{
				title: '老钱组第二次集体聚会',
				partyEntries: partyEntries,
				allcounts:allcounts
			})
		})
	})
	/*活动报名*/
	app.get('/entry',function(req,res){
		res.render('partyEntry',{
			title: '老钱组第二次集体聚会'
		})
	})
	/*报名提交*/
	app.post('/entry',function(req,res){
		var Party_Entry = new PartyEntry({
			name: req.body.name,
			phoneNO: req.body.phoneNO,
			partyID: 2,
			entryCount: req.body.entryCount,
			placeAdvice: req.body.placeAdvice,
			date: new Date(),
			suitableTime: req.body.suitableTime,
			tasteFavor: req.body.tasteFavor
		})
		Party_Entry.save(function(err, emotion) {
			if (err) {
				req.flash('error', err);
				writeLog(CONSTANT_LOG_ERROR,'partyEntry post error: ' + err);
				console.log(err);
				return res.redirect('/entry');
			}
			res.redirect('/party');
		})
	})

	/*推荐网页解析*/
	app.get('/recommends',function(req,res){
		var url = 'http://sh.meituan.com/deal/38940653.html?mtt=1.index%2Ffloornew.im.13.iqaiayvn';
		console.log(url);
		crawler.getInfo(url,function(err,options){
			if (err) {
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'recommends error: ' + err);
				req.flash('err',err);
				return;
			}

			res.render('recommends',{
				title: CONSTANT_TITLE,
				imgSrc: options.imgSrc,
				price: options.price,
				address: options.address
			});

		})
	})

	/*editor上传图片*/
	app.post('/uploadImg', function(req, res, next) {
		var form = new formidable.IncomingForm();
		form.keepExtensions = true;
		form.uploadDir = __dirname + '/../public/upload';
		console.log('dir='+ form.uploadDir);
		form.parse(req, function (err, fields, files) {
			if (err) {
				throw err;
			}
			var image = files.imgFile;
			var path = image.path;
			path = path.replace(/\\/g, '/');
			console.log('path='+ path);
			var url = '/upload' + path.substr(path.lastIndexOf('/'), path.length);
			var info = {
				"error": 0,
				"url": url
			};
			console.log("info"+ JSON.stringify(info));
			res.send(info);
		});
	});

	/*检测是否登录*/
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录!');
			writeLog(CONSTANT_LOG_ERROR,'login error: not login');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录!');
			writeLog(CONSTANT_LOG_ERROR,'login error: already logined');
			res.redirect('back'); //返回之前的页面
		}
		next();
	}

	/*检测是否登录*/
	function checkHappyLogin(req, res, next) {
		if (!req.session.happyUser) {
			req.flash('error', '未登录!');
			writeLog(CONSTANT_LOG_ERROR,'login error: not login');
			res.redirect('/behappy');
		}
		next();
	}

	function checkHappyNotLogin(req, res, next) {
		if (req.session.happyUser) {
			req.flash('error', '已登录!');
			writeLog(CONSTANT_LOG_ERROR,'login error: already logined');
			res.redirect('back'); //返回之前的页面
		}
		next();
	}

	/*时间转换成带0的数字*/
	function getTimeStr(date) {
		var year = date.getFullYear();
		var month = (date.getMonth()+1) > 9 ? (date.getMonth()+1)  : (0 + (date.getMonth()+1).toString());
		var day = date.getDate() > 9 ? date.getDate() : (0 + date.getDate().toString());
		var hour = date.getHours() > 9 ? date.getHours() : (0 + date.getHours().toString());
		var minute = date.getMinutes() > 9 ? date.getMinutes() : (0 + date.getMinutes().toString());
		var second = date.getSeconds() > 9 ? date.getSeconds() : (0 + date.getSeconds().toString());
		var millisecond = date.getMilliseconds();

		return year.toString() + month.toString() + day.toString() + hour.toString() + minute.toString() + second.toString() + millisecond.toString();
	}

	/*token检查*/
	function checkToken(req, res, next) {
		//var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
		var signature = req.query.signature;        
		var timestamp = req.query.timestamp;        
		var nonce = req.query.nonce;
		var token = 'weixin';
		var ArrTmp = new Array();
		ArrTmp[0] = token;
		ArrTmp[1] = timestamp;
		ArrTmp[2] = nonce;
		ArrTmp.sort();
		var tmpStr = ArrTmp.join("");
		//console.log("11"+tmpStr);
		//var key = "6U9eQ4zeyRKb95VlLPJ3Jrz5YviOUYpTK1QQATLtBK7";
		var tokenStr = crypto.createHash('sha1').update(tmpStr).digest('hex');
		writeLog("signature=" + signature + ";nonce=" + nonce + ";tmpStr=" + tmpStr + ";tokenStr=" + tokenStr);
		if (tokenStr && tokenStr == signature) {
			next();
		} else {
			res.end('Access token do not match', 400);
		}
	}

	/*写log*/
	function writeLog(err,str) {
		var meta = '[' + new Date() + ']' + '\n';
		if (err == CONSTANT_LOG_ERROR) {
			errorLog.write(meta + str + '\n')
		} else {
			accessLog.write(meta + str + '\n');
		}
	}

	/*微信获取accesstoken*/
	function getAccessToken(openId, callback) {
		var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET;
		//writeLog("res"+url);
		https.get(url, function(res) {
			var response = "";
			res.on('data', function(data) {
				response += data;
			})
			res.on('end', function() {
				writeLog("res=" + JSON.parse(response).access_token);
				return callback(JSON.parse(response).access_token, openId);
			})
		})
	}

	/*微信获取用户基本信息*/
	function getWechatUserInfo(accessToken, openId) {
		var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + accessToken + "&openid=" + openId + "&lang=zh_CN";
		writeLog("url=" + url);
		https.get(url, function(res) {
			var response = "";
			res.on('data', function(data) {
				response += data;
			})
			res.on('end', function() {
				writeLog("userInfo=" + response);
				return JSON.parse(response);
			})
		})
	}

	/*是否是用户*/
	app.get('/isUser/:name/:password',function(req,res){
		var md5 = crypto.createHash('md5');
		var name = req.params.name;
		var password = md5.update(req.params.password).digest('hex');

		User.get(name, function(err, user) {
			var errJson = '';
			if (err) {
				errJson = {
					error : err
				}
				writeLog(CONSTANT_LOG_ERROR,'isUser error: ' + err);
				res.send(errJson);
			}

			if (!user) {
				errJson = {
					error : '用户不存在!'
				}
				writeLog(CONSTANT_LOG_ERROR,'isUser error: ' + errJson.error);
				return res.send(errJson);
			}

			if (password != user.password) {
				req.flash('error', '密码错误!');
				errJson = {
					error : '密码错误!'
				}
				writeLog(CONSTANT_LOG_ERROR,'isUser error: ' + errJson.error);
				return res.send(errJson);
			}

			//req.flash('success','登陆成功!');
			writeLog(CONSTANT_LOG_SUCCESS,'isUser success: ');
			res.send(user);
		})
	})

	/*获取用户所有*/
	app.get('/getEmotions/:name',function(req,res){
		var name = req.params.name;
		console.log("name="+name);
		
		Emotion.getMyAll(name,function(err,emotions,pages){
			var errJson = '';
			if (err) {
				errJson = {
					error : err
				}
				writeLog(CONSTANT_LOG_ERROR,'getEmotions error: ' + errJson.error);
				res.send(errJson);
			}
			console.log("res="+emotions);
			emotions_get = emotions;
			writeLog(CONSTANT_LOG_SUCCESS,'getEmotions success: ');
			var elemets = new Array();
				//date转型
				for (var i=0;i< emotions.length;i++) {
					var date =  emotions[i].date.getFullYear()+'/'+(emotions[i].date.getMonth()+1)+'/'+emotions[i].date.getDate()+' '+ (emotions[i].date.getHours()>9?emotions[i].date.getHours():(0+emotions[i].date.getHours()))+':'+(emotions[i].date.getMinutes()>9?emotions[i].date.getMinutes():(0+emotions[i].date.getMinutes()));
					elemets.push({
						content: emotions[i].content,
						images: emotions[i].images,
						date: date,
						name: emotions[i].name
					});
				}
				res.send(elemets);
			})
	})

	app.get('/getArticles/:name',function(req,res){
		var name = req.params.name;
		Article.getAll(name,function(err,articles){
			var errJson = '';
			if (err) {
				errJson = {
					error : err
				}
				writeLog(CONSTANT_LOG_ERROR,'getArticles error: ' + errJson.error);
				res.send(errJson);
			}
			writeLog(CONSTANT_LOG_SUCCESS,'getArticles success: ');
			var elemets = new Array();
				//date转型
				for (var i=0;i< articles.length;i++) {
					var date =  articles[i].date.getFullYear()+'/'+(articles[i].date.getMonth()+1)+'/'+articles[i].date.getDate()+' '+ (articles[i].date.getHours()>9?articles[i].date.getHours():(0+articles[i].date.getHours()))+':'+(articles[i].date.getMinutes()>9?articles[i].date.getMinutes():(0+articles[i].date.getMinutes()));
					elemets.push({
						title: articles[i].title,
						author: articles[i].author,
						date: date,
						content: articles[i].content
					});
				}
				res.send(elemets);
			})
	})


	app.get('/h5show',function(req,res){
		// res.render('h5show',{});
		Poetry.getAll('laoda',function(err,poetries){
			if (err) {
				req.flash('error', err);
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'poetryshow get error: ' + err);
			}

			res.render('h5show',{
				poetries:poetries
			});
		})
	})

	app.get('/h5content',function(req,res){
		res.render('h5content',{});		
	})

	app.post('/h5content',function(req,res){
		var poe = req.body.poetry;
		var img = req.body.imagesrc;
		var fontcolor = req.body.fontcolor;
		var x = req.body.x;
		var y = req.body.y;
		var fontFamily = req.body.fontFamily;
		fontFamily = '20px' + fontFamily;
		var newPoetry = new Poetry({
			No: 0,
			theme: 'laoda',
			poe:poe,
			img:img,
			fontcolor:fontcolor,
			x:x,
			y:y,
			fontFamily:fontFamily
		});
		newPoetry.save(function(err,poetries){
			if (err) {
				req.flash('error', err);
				console.log(err);
				writeLog(CONSTANT_LOG_ERROR,'poetry post error: ' + err);
			}
			res.render('h5content',{});
		})
		
	})

	/*上传图片*/
	app.post('/upload',multipart(),function(req,res){
		var file = req.files.file;
		var date = new Date();
		var type;
		if (file.type.split('/')[1] === 'jpeg') {
			type = 'jpg'
		} else {
			type = file.type.split('/')[1];
		}
		var avatarName = 'poetry' + getTimeStr(date) + '.' + type;
		//+ file.type.split('/')[1]
		image = avatarName;
		var newPath = CONSTANT_FILE_FOLDER + avatarName;
		fs.readFile(file.path,function(err,bytesRead){
			fs.writeFile(newPath,bytesRead,function(file){
				res.send(avatarName);
			})
		})	
	})
	String.prototype.replaceAll = function(str1,str2){
		return this.replace(new RegExp(str1,"gm"),str2);
	}

	/*开放某条状态*/
	app.get('/opennessChange/:id/:openness',function(req,res){
		var openness = req.params.openness;
		var id = req.params.id;
		Emotion.updateField(id,openness,function(err,result){
			if (err) {
				writeLog(CONSTANT_LOG_ERROR,'opennessChange get error: ' + err);
			}
			res.send({'result': result});
		})
	})

	/*查看所有开放状态*/
	app.get('/allOpened',function(req,res){
		Emotion.getAllOpenned(function(err,emotions){
			if (err) {
				writeLog(CONSTANT_LOG_ERROR,'allOpened get error: ' + err);
			}
			var deviceType = Device.getType(req);
			if (deviceType == 'pc') {
				res.render('index', {
					allOpenned: true,
					title: CONSTANT_TITLE,
					emotions: emotions,
					pages:0,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			} else {
				res.render('mobileIndex', {
					allOpenned: true,
					title: CONSTANT_TITLE,
					emotions: emotions,
					pages:0,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			}
		})
	})

	var createID = function(){
		var date = new Date();
		var str = '';
		str= str + date.getFullYear() + num2Str(date.getMonth() + 1) + num2Str(date.getDate()) + num2Str(date.getHours()) + num2Str(date.getMinutes()) + num2Str(date.getSeconds());
		var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		for(var i = 0; i < 4 ; i ++) {
         var id = Math.ceil(Math.random()*35);
         str += chars[id];
     	}
     	return str;
	}

	var num2Str = function(num){
		return num >9 ? num : ('0' + num);
	}

}