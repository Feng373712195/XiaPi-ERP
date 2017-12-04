var express = require('express');
var User = require('../models/User');

var router = express.Router();
 
router.get('/',function(req,res,next) {
	 req.session.destroy(function(err){
       if(err) console.log("session销毁失败.");
       else console.log("session被销毁.");
    });
	
	res.render('user/login',{'title':'虾皮登陆'});
});

router.get('/reg',function(req,res,next) {
	console.log(req.session.user);
	res.render('user/register',{'title':'虾皮注册'});
});

router.post('/reg',function(req,res,next){
	console.log(req.body);
	var regcode = '123456789';
	var letterAry = ['A','B','C','D','E','F','G','H','I','J','K','L','N','M','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	if(req.body.regcode != regcode){
		res.json({code:1,msg:'内部注册码不正确'});
		return;
	}else{
		console.log(req.body.username)
		User.find(req.body.username,function(err,doc){
			if(err){
				res.json({code:'3',msg:'服务器错误，请联系开发人员QQ:373712195'});
				console.log('注册用户查找失败'+err);
			}else{
				console.log(doc);
				if(doc){
					res.json({code:'2',msg:'此用户名已经被注册'});
				}else{
					User.findAll(function(err,docs){
						if(err){
							console.log(err);
						}else{
							var user = new User(req.body.username,req.body.password,letterAry[docs.length]);
							user.save(function(err,data){
								if(err){
									res.json({code:'3',msg:'服务器错误，请联系开发人员QQ:373712195'});
									console.log('注册用户保存失败'+err);
								}else{
									console.log(data);
									res.json({code:'0',msg:'用户注册成功'});
								}
							});
						}
					});					
				}
			}
		})
	}
});

router.post('/login',function(req,res,next){
	User.find(req.body.username,function(err,doc){
		if(doc){
			console.log(doc);
			if(req.body.password != doc.password){
				res.json({code:'1',msg:'密码错误'});
				return;
			}
			req.session.user = req.body.username;
			res.json({code:'0',msg:'登陆成功'});
		}else{
			res.json({code:'2',msg:'没有此用户'});
			return;
		}
	});
});

router.get('/logout',function(req,res){
    //req.session.user = null;
    req.session.destroy(function(err){
       if(err) console.log("session销毁失败.");
       else console.log("session被销毁.");
    });
    res.redirect('/');
});

router.post('/AllUser',function(req,res,next){
	User.findAll(function(err,docs){
		if(err){
			res.json({code:'3',msg:'服务器错误，请联系开发人员QQ:373712195'});
		}else{
			res.json({code:'0',msg:docs});
		}
	});
});

module.exports = router;