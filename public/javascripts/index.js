(function($) {

	$('#loading').show();
	$('form').hide();
	var webshow = function(){
		$('form').show();
		var heigeht = window.innerHeight;
		var width = window.innerWidth;
		var content_top;
		if ($('.content-all')[0]) {
			content_top = $('.content-all').offset().top;
		}
		if ($('.content-main').css('height') < heigeht - content_top) {
			$('.content-all').css("height",heigeht - content_top);
		} else {
			$('.content-all').css("height",$('.content-main').css('height'));
		}

		if(!$('#loading').attr('id')) {
			$('.content-all').css('margin-top',70);
		}

		$('.description').css('height',heigeht - 240 -50);
		
		$('.publish').css("top",heigeht - 80);
		$('.publish').css("left",width - 120);

		$('.mobile-publish').css("top",heigeht - 60);
		$('.mobile-publish').css("left",width - 60);

		$('.publish').click(function(){
			$('#myModal').modal('show');
		})

		$('nav').hide();

		var pages = $('#pages').val();
		var curPage = $('#page').val();

		if (parseInt(curPage) <= parseInt(pages)){
		} else {
			$('#getmore').hide();
			$('.every-content').append('<div id="getmore" class="piece get-more">已经没有更多了</div>');
		}

	// $('#publish').click(function(){
	// 	var file = {
	// 		path: window.URL.createObjectURL($('#file-up').get(0).files[0]),
	// 		name:$('#file-up').get(0).files[0].name
	// 	}
	// 	var data = {
	// 		emotion: $('#emotion').val(),
	// 		path: "D:\Temp\\nodeJs\\pursue\\public\\images\\back.jpg",
	// 		name:$('#file-up').get(0).files[0].name
	// 	}
	// 	$.post('/index',data,function(){
	// 		window.location.reload();
	// 	});
	// })

	$('.btn-del').click(function(){
		$('#delModal').modal('show');
		$('#del-content').val($(this).prev().text());
	})

	$('#emotion-del').click(function(){
		$.post('/index/remove',{content:$.trim($('#del-content').val())},function(){
			window.location.reload();
		});
	})

	$('#logout').click(function(){
		$.get('/logout',function(){
			console.log('22');
			window.location.reload();
		})
	})

	// $('#upload').click(function(){
	// 	return $('#file-up').click();
	// })

	$('.a-upload').change(function(){
		var files = $('#pics').get(0).files;
		$.each(files,function(){
			if(this.name.split('.')[1] != "jpg" && this.name.split('.')[1] != 'png'){
				alert(this.name + '文件非照片！');
			} else{
				$('.image-show').append('<img src="'+window.URL.createObjectURL(this)+'" style="width:256px;height:180px;"/>')
			}
		})
	})

	$('.modal-close').on('click',function(){
		var children = $('.image-show').children();
		$.each(children,function(){
			this.remove();
		})
	})

	$('.imgUpload').change(function(){
		var files = $('#pics').get(0).files;
		$.each(files,function(){
			if(this.name.split('.')[1] != "jpg" && this.name.split('.')[1] != 'png'){
				alert(this.name + '文件非照片！');
			} else{
				$('.image-show').append('<img src="'+window.URL.createObjectURL(this)+'" style="width:256px;height:180px;"/>');
				$('.addphoto').hide();
				$('.image-show').after('<a class="addphoto"><input type="file" id="pics" class="imgUpload" name="pics" draggable="false" single accept="image/*" multiple="multiple" onchange="imgLoad()"></a>');
			}
		})
	})

	$('.open').on('click',function(){
		var id = $(this).next().val();
		var openness = $(this).text() == '不开放' ? 0 : 1;
		var ele = $(this);
		$.ajax({
			method: 'GET',
			url: '/opennessChange/' + id + '/' + openness,
			dataType: "json",
			success: function(data){
				if (ele.text() == '不开放') {
					ele.text('开放');
					ele.next().next().text('目前开放性：否');
				} else {
					ele.text('不开放');
					ele.next().next().text('目前开放性：是');
				}
			}
		});
	})

	if ($(".friend-chat-content")[0]) {

		$(".friend-chat-content").mCustomScrollbar({
			theme:"minimal-dark",
		// autoDraggerLength:false,
		// horizontalScroll:false,
		// advanced:{ 
		// 	autoExpandHorizontalScroll:false,
		// 	updateOnBrowserResize:false,
		// 	updateOnContentResize:false,
		// 	autoScrollOnFocus:true }
	});
	}

	// $('.every-content').infinitescroll({
	// 	navSelector : '#getmore',
	// 	nextSelector : '#getmore a',
	// 	itemSelector : '.every-content .piece',
	// 	animate: true,  
	// 	pixelsFromNavToBottom: 300
	// 	//extraScrollPx: 50
	// },
	// function(newElements,data,url){
	// 	if (data) {
	// 		console.log('exists');
	// 		// $.each(newElements,function(i,val){
	// 		// 	$('.every-content').append('<div id="piece" class="piece"> <label class="pieceContent">'+this.content+
	// 		// 		'</label><label class="btn-del">&times;</label><div class="content-image"></div><p class="publish-time">'+
	// 		// 		this.date.getFullYear()+'/'+this.date.getMonth()+'/'+this.date.getDate()+' '+ (this.date.getHours()>9?this.date.getHours():(0+this.date.getHours()))+':'
	// 		// 		+(this.date.getMinutes()>9?this.date.getMinutes():(0+this.date.getMinutes()))+'</p></div>');
	// 		// })
	// 	}
	// });
	$('#getmore a').click(function(){
		$.ajax({
			type: "GET",
			url: "/getPageData",
			data:{page: $('#page').val()},
			dataType: "json",
			success: function(data){
				if (data) {
					var pages = $('#pages').val();
					var curPage = $('#page').val();
					console.log('exists');
					$.each(data,function(i,val){
						var htmltext = '<div id="piece" class="piece"> <label class="pieceContent">'+this.content+'</label><label class="btn-del">&times;</label><div class="content-image">';
						if (val.images) {
							$.each(val.images.split(","),function(){
								htmltext+='<img src="files/'+this+'" style="width:256px;height:180px;"></img>'
							})
						}
						htmltext+='</div><p class="publish-time">'+val.date+'</p></div>';
						$('#getmore').before(htmltext);
					});
					if (parseInt(curPage) < parseInt(pages)){
							// $('.every-content').append('<div id="getmore" class="piece get-more"><a href="javascript:;">加载更多内容&darr;</a></div>');
						} else {
							$('#getmore').hide();
							$('.every-content').append('<div id="getmore" class="piece get-more">已经没有更多了</div>');
						}
						$('#page').val(parseInt(curPage)+1);
					}
				}
			})
	})

	var ajax_req = true;

	$(document).scroll(function(){
		var scrllTop = $(document).scrollTop();
		if (scrllTop >= ($(document).height() -heigeht - 100) && pages>=$('#page').val() && ajax_req) {
			//alert('doing');
			ajax_req = false;
			$.ajax({
				type: "GET",
				url: "/getPageData",
				data:{page: $('#page').val()},
				dataType: "json",
				success: function(data){
					if (data) {
						var pages = $('#pages').val();
						var curPage = $('#page').val();
						console.log('exists');
						$.each(data,function(i,val){
							var htmltext = '<div id="piece" class="piece"> <label class="pieceContent">'+this.content+'</label><label class="btn-del">&times;</label><div class="content-image">';
							if (val.images) {
								$.each(val.images.split(","),function(){
									htmltext+='<img src="files/'+this+'" style="width:256px;height:180px;"></img>'
								})
							}
							htmltext+='</div><p class="publish-time">'+val.date+'</p></div>';
							$('#getmore').before(htmltext);
						});
						if (parseInt(curPage) < parseInt(pages)){
							// $('.every-content').append('<div id="getmore" class="piece get-more"><a href="javascript:;">加载更多内容&darr;</a></div>');
						} else {
							$('#getmore').hide();
							$('.every-content').append('<div id="getmore" class="piece get-more">已经没有更多了</div>');
						}
						$('#page').val(parseInt(curPage)+1);
					}
					ajax_req = true;
				}
			})
		}
		var headerHeight = $('header').height();
		if (scrllTop>= headerHeight) {
			$('nav').show();
			$('header').hide();
		} else {
			$('nav').hide();
			$('header').show();
		}
	})

	$('.nav-user').hide();
	$('.glyphicon').click(function(){
		$('.nav-user').toggle();
	})

	$('#emotion').on('input',function(){
		$('#emotion').css('height',$('#emotion')[0].scrollHeight);
	});

	$('#tab').click(function(){
		$('#emotion').val($('#emotion').val() + '\n');
	})
}
var load = function(){
	var ele = document.getElementById('loading');
	var ctx = ele.getContext('2d');
	var circle = {
		x: 250,
		y: 250,
		rotation: 2,
		r: 200
	}
	var drawC1 = function(){
		ctx.beginPath();
		ctx.arc(circle.x,circle.y,circle.r,0,Math.PI * 2,true);
		ctx.stroke();
	}
	
	var drawC2 = function(){
		ctx.beginPath();
		ctx.arc(circle.x,circle.y,150,0,Math.PI * 2,true);
		ctx.stroke();
	}
	
	var progress = {
		lineWidth: 50,
		beginPath: 0,
		endPath: 2*2*Math.PI/100,
		speed:2
	}
	var progressChange = function(i){
		progress.beginPath = (i*2)*2*Math.PI/100;
		progress.endPath = (i*2+2)*2*Math.PI/100;
	}
	var gradient1 = ctx.createLinearGradient(375, 0, 25, 0);
	gradient1.addColorStop("0","magenta");
	gradient1.addColorStop("0.5","blue");
	gradient1.addColorStop("1.0","red");
	var drawProgress = function(i){
		ctx.lineWidth=50;
		progressChange(i);
		ctx.strokeStyle = gradient1;
		ctx.save();
		ctx.beginPath();
		ctx.arc(circle.x,circle.y,175,progress.beginPath,progress.endPath,false);
		ctx.stroke();
		ctx.restore();
	}

	var drawProgressNum = function(i){
		ctx.font="30px Verdana";
		ctx.strokeStyle='black';
		ctx.lineWidth = 2;
		ctx.clearRect(150,150,150,150);
		ctx.strokeText(i*2+"%",230,270);
	}

	drawC1();
	drawC2();
	var jj = 0;
	var timer1 = setInterval(function(){
		if (jj >50) {
			$('#loading').hide();
			$('form').show();
			webshow();
			clearInterval(timer1);
			return true;
		} else {
			drawProgress(jj);
			drawProgressNum(jj);
			jj++;
		}
		
	},100);
}
$('.nav-user').hide();
$('nav').hide();
if (document.getElementById('loading')) {
	load();
} else {
	webshow();
	$('nav').show();
	$('header').hide();
}

})(jQuery);

function imgLoad(){
	var files = $('#pics').get(0).files;
	$.each(files,function(){
		if(this.name.split('.')[1] != "jpg" && this.name.split('.')[1] != 'png'){
			alert(this.name + '文件非照片！');
		} else{
			$('.image-show').append('<img src="'+window.URL.createObjectURL(this)+'" style="width:256px;height:180px;"/>');
			$('.addphoto').hide();
			$('.image-show').after('<a class="addphoto"><input type="file" id="pics" class="imgUpload" name="pics" draggable="false" single accept="image/*" multiple="multiple" onchange="imgLoad()"></a>');
		}
	})
}