var gnbox = document.querySelector('.btnbox');
var gn = document.getElementById('gn');

gn.addEventListener('click',function(){
	if(gnbox.classList.contains('bleft')){
		gnbox.classList.remove('bleft');
		gnbox.classList.add('aleft');
	}else{
		gnbox.classList.remove('aleft');
		gnbox.classList.add('bleft');
	}
});

function backfun(btn){
	btn.addEventListener('click',function(){
		/*mui.openWindow({
			url:"data.html",
			id:"data"
		})*/
		mui.back();
	})
}

function datafun(btn){
	btn.addEventListener('click',function(){
		mui.openWindow({url:"/data"});
	});
}

function indexfun(btn){
	btn.addEventListener('click',function(){
		mui.openWindow({url:"../"});
	});
}

function revisefun(btn,obj){
	btn.addEventListener('click',function(){
		mui.openWindow({url:"../revise/"+obj});
	});
}

function searchfun(btn){
	btn.addEventListener('click',function(){
		mui.openWindow({url:"/search"})
	});
}

function fromfun(btn){
	btn.addEventListener('click',function(){
		mui.openWindow({url:"/from"})
	});
}


function removefun (btn,obj){
	btn.addEventListener('click',function(){
		var r = confirm('确定删除 产品编号:<'+obj+'>吗?');

		if(r){

			var p = prompt('请在以下输入框输入“立即删除”',"");

			if(p == "立即删除"){
				
				$.ajax({
				    type: 'POST',
				    url:/remove/+obj,
				    dataType:'json',    
				     success: function(data){
				     	console.log(data);
				     	if(data.state == '0'){
				     		alert('删除成功');
				     		mui.openWindow({url:'/data'});
				     	}else if(data,state == '500'){
				     		alert('删除失败');
				     	}
				     },
				     error:function(err){
				     	console.log(err);
				     }
				});
			}
		};
	});	
}
