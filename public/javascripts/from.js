	
	function gId(ele){
		return document.getElementById(ele);
	}
	
	var btn = gId('btn'),pic = [],
		code =gId('code'),
		price = gId('price'),
		supplier = gId('supplier'),
		address = gId('address'),
		website = gId('website'),
		emarks =gId('emarks'),
		files =gId('files'),
		title = gId('title');
		dz = gId('dz');

	var sort;
		
	var getbtn =gId('getbtn');
	var filesArray = document.getElementsByName('filesArray');
	var Form = document.getElementsByTagName('form')[0];
	
	var picInp = document.getElementsByName('Picfiel')[0];
	var picItem = document.querySelectorAll('.pic-Item');
	var files,filesName;

	 picInp.addEventListener('change',function(){
	 	 files = this.files
	 	 filesArray = [];
	 	 if(files.length>9){
	 	 	picInp.value = '';
	 	 	alert('上传图片数量大于9张,请重新选择');
	 	 	return;
	 	 };
	 	 for(var i = 0;i<files.length;i++){
	 	 	if(!/image\/\w+/.test(files[i].type)){ 
	 	 		filesName = files[i];
	 	 		console.log(filesName.name);
		    	console.log(files[i]);
		    	picInp.value='';
		        alert(filesName.name +"不为图片，文件必须为图片！");
		        return false; 
			};
		  };
		  for(var r =0; r<picItem.length; r++){
		  	if(r==0){
		  		document.querySelectorAll('.pic-Item')[r].innerHTML = '主图';
		  	}else{
		  		document.querySelectorAll('.pic-Item')[r].innerHTML = '副图';
		  	}
		  }
		  for(var i2 = 0;i2<files.length;i2++){
		  	var reader = new FileReader(); //声明一个FileReader实例
		    reader.readAsDataURL(files[i2]); //调用readAsDataURL方法来读取选中的图像文件
		    //最后在onload事件中，获取到成功读取的文件内容，并以插入一个img节点的方式显示选中的图片
//		    reader.onload = function(e){ 
//		    	console.log(i2);
//			}; 
			(function(i){
				picItem[i].setAttribute('data-fileName',files[i2].name);
				reader.onload = function(e){ 
					console.log(i)
		    		picItem[i].innerHTML =  '<img class="Item-pic" src="'+this.result+'" alt=""/>'
				}; 
			})(i2);
		  }
	 	},false);
	
	/*排序逻辑*/
	var PicArg = [];

	mui('.pic-box').on('click','.pic-Item',function(){
		setSortable();
	})

	function setSortable() {
		sort = new Sortable(document.getElementById('pic-box'),{
			chosenClass: 'sort-chosen',
			ghostClass: 'sort-ghost',
			scroll: false,
			animation: 400,
			handle: '.pic-Item',
			isDropAnimation: false, //自定义属性
			onStart: function(evt) { // 拖拽
				sortArg = [];	
				for(var i =0;i<document.querySelectorAll('.pic-Item').length;i++){
					sortArg.push(document.querySelectorAll('.pic-Item')[i].innerHTML);
				}
			},
			onEnd: function(evt) { // 拖拽结束
				PicArg = []
				// console.log(document.querySelectorAll('.pic-Item').length);
				for(var i =0;i<document.querySelectorAll('.pic-Item').length;i++){
					if(document.querySelectorAll('.pic-Item')[i].innerHTML.indexOf('img') != -1){
						PicArg.push(document.querySelectorAll('.pic-Item')[i].dataset.filename);
					}else if(i==0&&document.querySelectorAll('.pic-Item')[i].innerHTML.indexOf('img')== -1){
						console.log(i);
						document.querySelectorAll('.pic-Item')[i].innerText = '主图';
					}else if(i!=0&&document.querySelectorAll('.pic-Item')[i].innerHTML.indexOf('img')== -1){
						document.querySelectorAll('.pic-Item')[i].innerText = '副图';
					}
				}
				console.log(PicArg);
				for(var i2 =0;i2<PicArg.length;i2++){
					if(document.querySelectorAll('.pic-Item')[i2].innerHTML.indexOf('主图') != -1||document.querySelectorAll('.pic-Item')[i2].innerHTML.indexOf('副图')!= -1){
						for(var i3 =0;i3<sortArg.length;i3++){
							document.querySelectorAll('.pic-Item')[i3].innerHTML = sortArg[i3];
						};
						alert('错误排序')
						break;
					}
				}
			}
		});
	}




	