var express = require('express');

Post = require('../models/Post');
Cgd = require('../models/cgd');
User = require('../models/User');
Shipment = require('../models/Shipment');

/*解析Excel模块*/
var XLSX = require('xlsx');
/*解析上传文件*/
var multer = require('multer');
/*子进程*/
var child_process = require('child_process');

fs = require('fs');
var router = express.Router();
var upload = multer({dest:'../images'});

/*判断session 是否为登陆账户*/
function checkLogin(req,res,next){
	console.log(req.session);
	if(!req.session.user){
		console.log('nosession'+req.session.user);
		res.redirect('/');
	}
	next();
}

router.get('/Index',checkLogin);
router.get('/Index',function(req,res,next) {
	res.render('index',{'title':'虾皮首页','session':req.session.user});
});

router.get('/data',checkLogin);
router.get('/data',function(req,res,next){
	res.render('pagin/data',{
		'title':'查看数据'
	});
});
router.post('/data',function(req,res,next) {

	var letter = req.body.letter;
	var pageNum = req.body.pageNum;
	var pageSize = req.body.pageSize;

	Post.data(function(users){
		if(!users){
			console.log('获取全部数据失败');
			return;
		};

		var usersObj = users;
		var screenUserObj = [];
		var userDataCode;

		for(var x in usersObj){
			userDataCode = usersObj[x].code.split('-');
			if(userDataCode[userDataCode.length-1].indexOf(letter) != -1){				
				screenUserObj.push(usersObj[x]);
			};
		};

		function compare(property){
			return function(a,b){
				var arg1 = a[property].split('-');
				var arg2 = b[property].split('-');
				var value1 =  arg1[arg1.length-1].replace(/^[A-Z]{1}/,"");
				var value2 =  arg2[arg2.length-1].replace(/^[A-Z]{1}/,"");
				
				console.log(value1);
				console.log(value2);
				
				return value1 - value2;
			}
		}

		var sortUsers = screenUserObj.sort(compare('code'));
		var usersDatalength = sortUsers.length;
		
		sortUsers = sortUsers.splice(pageNum,pageSize);

		res.json({userData:sortUsers,datalenght:usersDatalength});
	});
});

router.get('/search',checkLogin);
router.get('/search',function(req,res,next){
	res.render('pagin/search',{title:'搜索数据'});
})

router.post('/search',function(req,res,next){

	console.log(req.body);

	Post.search(req.body,function(err,docs){
		if(err){
			console.log(err);
		}
		console.log(docs);
		res.send(docs);
	});


});

router.get('/from',checkLogin);
router.get('/from',function(req,res,next) {

	User.find(req.session.user,function(err,doc){
		if(doc){
			var date = new Date();

			Post.data(function(users){
				if(!users){
					console.log('获取全部数据失败');
					return;
				};

				var usrlength = 0;
				var zero = '';
				var userDataCode;
				
				users.forEach(function(value,index){
					userDataCode = value.code.split('-');
					if(userDataCode[userDataCode.length-1].indexOf(doc.letter)!= -1){
						usrlength++;
					}
				});
				
				console.log(usrlength.toString().length);
				
				setTimeout(function(){
					for(var i = 0;i<5-usrlength.toString().length;i++){
						console.log('0');
					 	zero += '0';
					};
					
					var l = date.getFullYear() + '-' + Number(date.getMonth()+1) + '-' + doc.letter + zero + (usrlength+1);
					var l = doc.letter + zero + (usrlength+1);
					res.render('pagin/from',{'title':'添加数据','code':l});
				},130);	
			})

		}else{
			res.redirect('/');
		}
	});


});

router.get('/details/:code',checkLogin);
router.get('/details/:code',function(req,res,next){
	console.log(req.params.code);
	Post.getOne(req.params.code,function(err,doc){
		if(err){
			console.log('查找数据失败',err)
		}
		console.log('查找数据成功',doc)
		res.render('pagin/details',{
			'title':'数据详情',
			'doc':doc
		});
	})
});

router.get('/revise/:code',checkLogin);
router.get('/revise/:code',function(req,res,next){

	Post.getOne(req.params.code,function(err,doc){
		if(err){
			console.log('查找数据失败',err)
		}
		console.log('查找数据成功',doc)
		res.render('pagin/revise',{
			'title':'修改数据',
			'doc':doc
		});
	});
});

router.post('/revise',upload.array('Picfiel',9),function(req,res,next){
	// var Nwefiles = req.body.Nwefiles
	// console.log(req.body);
	// console.log(req.files[0].originalname);
	// console.log(req.body.Newfiles.toString() == req.body.Oldfiles);
	// console.log(req.body.Nwefiles == req.body.Oldfile);


	var filesArray = [] , Newfiles;

	req.files.forEach(function(filename){
		console.log(filename.originalname);
		filesArray.push(filename.originalname);
	});


	var fileName = './public/uploadImg/';
	var fileUrl = '../images';

	Post.getOne(req.body.OldCode,function(err,doc){
		if(err){
			console.log('查找数据失败',err);
		}
		console.log('查找数据成功',doc);

		var post;

		if(filesArray.toString().length == 0){
			Newfiles = doc.pic?doc.pic.toString():'';
		}else{
			Newfiles = filesArray.toString();
		};

		if(req.body.OldCode != req.body.code){

			if( doc.pic.toString() != Newfiles){

				console.log('图片有所改变');
				var files = fs.readdirSync(fileName +req.body.OldCode);
				for(var i = 0;i<files.length;i++){
					fs.unlinkSync(fileName +'/'+ req.body.OldCode +'/'+files[i]);
					console.log("删除文件"+files[i]+"成功");
				}
				for(var i2 = 0;i2<req.files.length;i2++){
					var target_path = './public/uploadImg/'+req.body.OldCode+'/'+req.files[i2].originalname;
					fs.renameSync(req.files[i2].path,target_path);
				};

		        fs.renameSync(fileName + req.body.OldCode,fileName + req.body.code);

		  		post = new Post(req.body.code,filesArray,req.body.price,req.body.supplier,req.body.address,req.body.website,req.body.emarks,req.body.title);

			}else{
				console.log('图片没有改变');

				fs.renameSync(fileName + req.body.OldCode,fileName + req.body.code);
				post = new Post(req.body.code,doc.pic,req.body.price,req.body.supplier,req.body.address,req.body.website,req.body.emarks,req.body.title);
			}

			console.log('OldCode与NewCod不等');

        }else{

        	if(doc.pic.toString() != Newfiles){
        		console.log('图片有所改变');
				var files = fs.readdirSync(fileName +req.body.OldCode);
				for(var i = 0;i<files.length;i++){
					fs.unlinkSync(fileName +'/'+ req.body.OldCode +'/'+files[i]);
					console.log("删除文件"+files[i]+"成功");
				}
				for(var i2 = 0;i2<req.files.length;i2++){
					var target_path = './public/uploadImg/'+req.body.OldCode+'/'+req.files[i2].originalname;
					fs.renameSync(req.files[i2].path,target_path);
				};
		        post = new Post(req.body.OldCode,filesArray,req.body.price,req.body.supplier,req.body.address,req.body.website,req.body.emarks,req.body.title)

			}else{
				console.log('图片没有改变');

				post = new Post(req.body.OldCode,doc.pic,req.body.price,req.body.supplier,req.body.address,req.body.website,req.body.emarks,req.body.title);
			}

			console.log('OldCode与NewCod相等');
        };

        post.update(req.body.OldCode,function(err){
    		if(err){
    			console.log('更新数据失败');
    		}
    		console.log('更新数据成功');

    		var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});

    		var files = fs.readdirSync(fileUrl);

        	for(var i3 = 0;i3<files.length;i3++){
        		 fs.unlinkSync(fileUrl+'/'+files[i3]);
        	};

			res.redirect('/data');
    	});

	});

});


router.post('/remove/:code',function(req,res,next){
	Post.remove(req.params.code,function(err){
		if(err){
			console.log('删除数据失败',err);
			res.send({state:'500'});
			return;
		}
		console.log('删除数据成功');
	    var exec = child_process.exec;
		exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
		   if (error) {
		     console.log(error.stack);
		     console.log('Error code: '+error.code);
		     return;
		   }
		   console.log('使用exec方法输出: '+stdout);
		   console.log(`stderr: ${stderr}`);
		});
		
		res.send({state:'0'});

		var	fileUrl = './public/uploadImg/'+req.params.code
		var files = fs.readdirSync(fileUrl);//读取该文件夹
        files.forEach(function(file){
            fs.unlinkSync(fileUrl+'/'+file);
            console.log("删除文件"+fileUrl+'/'+file+"成功");
        });

        fs.rmdirSync(fileUrl);
	});
});



router.post('/from',upload.array('Picfiel',9),function(req,res,next){
	
	console.log(req.body);
	var filesArray = [];
	var cacheDir = '../images';

	if(fs.existsSync('./public/uploadImg/'+req.body.code)){
		console.log('文件已经存在');
		return;

	}else{

		fs.mkdirSync('./public/uploadImg/'+req.body.code, 0777);
		req.files.forEach(function(filename){
			var target_path = './public/uploadImg/'+req.body.code+'/'+filename.originalname;
			fs.renameSync(filename.path,target_path);
			filesArray.push(filename.originalname);
		});

		 var fileUrl = '../images';
		 var files = fs.readdirSync(fileUrl);
		 files.forEach(function(file){
              fs.unlinkSync(fileUrl+'/'+file);
         });

     	var post = new Post(req.body.code,filesArray,req.body.price,req.body.supplier,req.body.address,req.body.website,req.body.emarks,req.body.title);
		post.from(function(err){
			if(err){
				console.log('录入失败');
				return;
			}
			console.log('录入成功');
			var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});
		});
	};

	// res.redirect('/from');
	res.redirect('/details/' + req.body.code);
});

router.post('/sortPic',function(req,res,next){
	console.log(req.body)

	Post.sortPic(req.body.code,req.body.pic,function(err,doc){
		if(err){
			console.log('排序图片失败');
			res.json({code:'1',msg:'排序图片失败'});
		}else{
			console.log('排序图片成功');
			res.json({code:'0',msg:'排序图片成功',doc:doc});
		}
	})
});

router.get('/purchasing',checkLogin);
router.get('/purchasing',function(req,res,next){
	res.render('pagin/purchasing',{title:'采购单'});
});

router.post('/purchasing/code',function(req,res,next){
	Post.getOne(req.body.code,function(err,docs){
		if(err){
			console.log(err);
			res.json({code:'-1',msg:'查找失败'})
		}
		if(docs){
			res.json({code:'0',msg:'查找到此数据',doc:docs});
		}else{
			res.json({code:'1',msg:'查无此数据'});
		}
	});
});

router.post('/purchasing/time',function(req,res,next){
	Cgd.findOnd(req.body.Time,function(err,doc){
		if(!doc){
			res.json({code:'0',msg:req.body.Time+'没有此日期采购单'});
		}else{
			res.json({code:'1',msg:req.body.Time+'已经有此日期采购单',doc:doc});
		}
	});
});

router.post('/purchasing/save',function(req,res,next){

	var cgd = new Cgd(req.body.Time,req.body.Arr,req.body.CgS,req.body.PicS,req.body.Lacks,req.body.Prices);
	cgd.save(function(err,data){
		if(err){
			res.json({code:'-1',msg:err+'存储失败，请稍后再试'});
		}else{
			console.log(data);
			var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});
			res.json({code:'0',msg:req.body.Time+'存储成功'});
		}
	});
})

router.post('/purchasing/updata',function(req,res,next){
	console.log(req.body);

	var Arr = req.param('Arr[]') || req.body.Arr;
	var CgS = req.param('CgS[]') || req.body.CgS;
	var PicS = req.param('PicS[]') || req.body.PicS;
	var Lacks = req.param('Lacks[]') || req.body.Lacks;
	var Prices = req.param('Prices[]') || req.body.Prices;

	var updata = {Arr:Arr,CgS:CgS,PicS:PicS,Lacks:Lacks,Prices:Prices};

	console.log(updata);

	Cgd.updata(req.body.Time,updata,function(err,data){
		if(err){
			res.json({code:'-1',msg:err+'存储失败，请稍后再试'});
		}else{
			console.log(data);
			var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});
			res.json({code:'0',msg:req.body.Time+'存储成功'});
		}
	});
})

router.post('/purchasing/addremarks',function(req,res,next){
	console.log(req.body)

	var code = {code:req.body.code};
	var remarks = {emarks:req.body.remark};

	Post.Addremarks(code,remarks,function(err){
		if(err){
			res.json({code:'1',msg:err+'添加备注失败'});
			console.log(err);
		}else{
			res.json({code:'0',msg:'添加备注成功'});
		}
	})
});

router.post('/purchasing/cgd',function(req,res,next){

	var Parr = req.param('PArr[]') || req.body.PArr;
	console.log(Parr);

	Post.findArr(Parr,function(err,docs){
		if(err){
			console.log(err);
			callback(err)
		}else{
			res.send(docs);
		}
	});
});

router.post('/purchasing/qj',function(req,res,next){

	console.log(req.body.TimeArr)

	Cgd.QJsearch(req.body.TimeArr,function(err,docs){
		if(err){
			console.log(err);
			res.json({code:'1',msg:'搜索失败'})
		}else{
			res.json({code:'0',msg:'搜索成功',docs:docs})
		}
	});
});

router.post('/purchasing/pt',function(req,res,next){
	console.log(req.body);

	var Time = req.body.Time;

	if(Time.split('-')[1] < 10){
		
		console.log('replace');

		var a = Time.split('-')[1].replace('0','');
		Time = Time.split('-')[0] + '-' + a + '-' + Time.split('-')[2];
	}

	Cgd.findOnd(Time,function(err,doc){
		if(err){
			console.log(err);
			res.json({code:'1',msg:'搜索失败'});
		}else{
			res.json({code:'0',msg:'搜索成功',doc:doc});
		}
	});
});

router.post('/purchasing/remove',function(req,res,next){
	console.log(req.body.Time)

	Cgd.remove(req.body.Time,function(err){
		if(err){
			console.log(err);
			res.json({code:'1',msg:'删除失败'});
		}else{
			var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});
			res.json({code:'0',msg:'删除成功'});
		}
	})

});

router.get('/applist',checkLogin);
router.get('/applist',function(req,res,next){

	Cgd.findAll(function(err,docs){
		if(err){
			console.log(err)
		}else{
			res.render('pagin/appList',{

				title:'采购单选择',
				lists:docs

			});
		}
	})
});

router.post('/applist',function(req,res,next){
	Cgd.findAll(function(err,docs){
		if(err){
			console.log(err)
		}else{
			res.json({docs:docs})
		}
	})
});

router.get('/appInfo/:Time',checkLogin);
router.get('/appInfo/:Time',function(req,res,next){
	res.render('pagin/appInfo',{title:req.params.Time+'   采购单详情'});
});

/*出货统计 出货金额  虾皮总金额*/
router.get('/chtj',checkLogin);
router.get('/chtj',function(req,res,next){
	res.render('pagin/chtj',{title:'出货统计','session':req.session.user});
})

router.get('/chje',checkLogin);
router.get('/chje',function(req,res,next){
	res.render('pagin/chje',{title:'出货金额','session':req.session.user});
});

router.get('/total',checkLogin);
router.get('/total',function(req,res,next){
	res.render('pagin/total',{title:'虾皮总金额','session':req.session.user});
});

router.post('/updata/excel',upload.single('fileupload'),function(req,res,next){


	 var workbook = XLSX.readFile(req.file.path);
	 var sheetNames = workbook.SheetNames;
	 var worksheet = workbook.Sheets[sheetNames[0]];// 获取excel的第一个表格
	 var ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
	 var reg = /[a-zA-Z]/g;
	 ref = ref.replace(reg,"");
	 var line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
	 console.log("line====>",line);

	 var orders = [];

	 for(var i = 2; i <= line; i++){
        if(!worksheet['A'+i]){   //如果大于2的某行为空,则下面的行不算了
             break;
         }
         var order = {};
         // var code =worksheet['A'+i]? worksheet['A'+i].v || '';
         order.code =worksheet['A'+i]? worksheet['A'+i].v:'';
         order.state = worksheet['B'+i]? worksheet['B'+i].v:'';
         order.refund =  worksheet['C'+i]? worksheet['C'+i].v:''
         order.number = worksheet['D'+i]?worksheet['D'+i].v:'';
         order.foundingTime = worksheet['E'+i]?worksheet['E'+i].v:'';
         order.paymentTime = worksheet['F'+i]?worksheet['F'+i].v:'';
         order.subtotal = worksheet['G'+i]?worksheet['G'+i].v:'';
         order.freight = worksheet['H'+i]?worksheet['H'+i].v:'';
         order.total =worksheet['I'+i]? worksheet['I'+i].v:'';
         order.consultation = worksheet['J'+i]?worksheet['J'+i].v:'';
         order.recipientAddress = worksheet['K'+i]?worksheet['K'+i].v : '';
         order.country = worksheet['L'+i]?worksheet['L'+i].v : '';
         order.city = worksheet['M'+i]?worksheet['M'+i].v : '';
         order.administrativeRegion =worksheet['N'+i]? worksheet['N'+i].v: '';
         order.postcode = worksheet['O'+i]? worksheet['O'+i].v : '';
         order.recipients = worksheet['P'+i]?worksheet['P'+i].v : '';
         order.telephone = worksheet['Q'+i]? worksheet['Q'+i].v : '';
         order.dealingMethod = worksheet['R'+i]? worksheet['R'+i].v: '';
         order.paymentMethod =worksheet['S'+i]? worksheet['S'+i].v : '';
         order.latestTime = worksheet['T'+i]?worksheet['T'+i].v: '';
         order.expressQuery = worksheet['U'+i]?worksheet['U'+i].v:'';
         order.realTime =worksheet['V'+i]? worksheet['V'+i].v: '';
         order.completionTime =worksheet['W'+i]? worksheet['W'+i].v:'';
         order.buyerNotes =worksheet['X'+i]? worksheet['X'+i].v :'';
         order.remarks =worksheet['Y'+i]? worksheet['Y'+i].v:'';
         orders.push(order);

         // console.log(!!worksheet['B'+i].v?worksheet['C'+i].v:'');
     }
	
	return res.json({orders});
});

router.post('/chtj/save',function(req,res,next){
	console.log(req.body);

	var shipment = new Shipment(req.body.username,req.body.tablename,req.body.table);
	shipment.save(function(err,data){
		if(err){
	 		console.log(err);
	 		res.json({code:'1',msg:'保存失败'});
	 	}else{
	 		console.log(data);

	 		/*数据库备份*/
	 		var exec = child_process.exec;
			exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
			   if (error) {
			     console.log(error.stack);
			     console.log('Error code: '+error.code);
			     return;
			   }
			   console.log('使用exec方法输出: '+stdout);
			   console.log(`stderr: ${stderr}`);
			});
	 		res.json({code:'0',msg:'保存成功'});
	 	}
	 });

});

router.post('/chtj/remove',function(req,res,next){
	console.log(req.body);

	Shipment.remove(req.body,function(err,data){
		if(err){
			console.log(err);
			res.json({code:1})
			return;
		}

		var exec = child_process.exec;
		exec('/usr/local/mongodb/bin/./mongodump -h localhost:27017 -d cpk -o /usr/local/mongodb/data/cpkBF/',function(error,stdout,stderr){
		   if (error) {
		     console.log(error.stack);
		     console.log('Error code: '+error.code);
		     return;
		   }
		   console.log('使用exec方法输出: '+stdout);
		   console.log(`stderr: ${stderr}`);
		});
		res.json({code:0})
	});
});

router.post('/chtj/fine',function(req,res,next){
	console.log(req.body);
	Shipment.fine(req.body,function(err,data){
		if(err){
			console.log(err);
		}else{
			// console.log(data);
			res.json(data);
		}
	});
});

router.post('/chtj/fineOne',function(req,res,next){

	Shipment.findOne(req.body,function(err,data){
		if(err){
			console.log(err);
		}else{
			// console.log(data);
			res.json(data);
		}
	});
});

router.post('/chtj/update',function(req,res,next){
	
	console.log(req.body);
	var	query  = {username:req.body.username,tablename:req.body.oldtablename};
	var uptable = {tablename:req.body.tablename,table:req.body.table};

	console.log(query);
	console.log(uptable);

	Shipment.update(query,uptable,function(err,data){
		if(err){
			console.log(err);
		}else{
			console.log('data'+JSON.stringify(data));
			res.json(data);
		}
	});
});

router.post('/uptext',upload.single('fileupload2'),function(req,res,next){

	console.log(req.file);
	fs.rename(req.file.destination +'/'+ req.file.filename ,req.file.destination +'/tests.txt',function(err){
		if(err){
			console.log(err)
		}else{
			fs.readFile(req.file.destination +'/tests.txt','utf-8',function(err,data){  
			    if(err){  
			        console.error(err);  
			    }else{  
			    	var test = data.split(/[\r\n]/);
			    	var resTest = test.filter(function(value,index){
			    		return value;
			    	});
					fs.unlinkSync(req.file.destination +'/tests.txt');
			        res.json({data:resTest});
			    }  
			});
			console.log('修改文件成功');  
		}
	});
});


router.post('/testupdate',function(req,res,next){
	//0为不用更新
	//1为更新
	//-1为需要重装客户端
	var describe = '<div>修改图片问题</br></div>';
	var edition = req.body.ver
	var newEdition = '1.1.6';
	var Reload = false;

	if(Reload){
		res.json({code:-1,msg:describe,reload:'www.baidu.com'});
		return;
	};

	if(edition == newEdition){
		res.json({code:0,msg:'此为最新版本'});
	}else{
		res.json({code:1,msg:describe});
	}
});

router.get('/updateApp',function(req,res,next){
	var downloadPath = './public/resources/updatepackage/cpk.wgt';
	res.download(downloadPath); 
});




router.get('*',function(req,res,next){
	res.render('404');
});



module.exports = router;