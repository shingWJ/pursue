(function($) {
	var heigeht = window.innerHeight;
	var width = window.innerWidth;
	if ($('#login-back').length>0){
		var top = document.getElementById('login-back').offsetTop;
		$('#login-back').css("height",heigeht - top);
	}
	
	if($('#regist-back').length >0){
		var reg_top = document.getElementById('regist-back').offsetTop;
		$('#regist-back').css("height",heigeht - reg_top);
	}
	var height_ctx = heigeht - $('header').height();
	$('#left-tips').css("height",height_ctx);
	$('#left-tips').css("width",width);
	$('.cav-main').css('top',$('header').height());

	$('body').css('overflow','hidden');

	$('#regist').click(function(){
		window.location = '/regist';
	})

	var eles = document.getElementById('left-tips');
	if (eles){
		var ctx = eles.getContext('2d');
		var image = new Image();
		image.src = "/images/b1.jpg";
		image.onload = function(){
			ctx.drawImage(image,1188,336,width,height_ctx,0,0,width,height_ctx);
			ctx.font="10px Verdana";
		// 创建渐变
		var gradient=ctx.createLinearGradient(0,0,60,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		// 用渐变填色
		ctx.fillStyle="white";
		ctx.fillText("一万个美丽的未来",10,90);
		ctx.fillText("也抵不上一个温暖的现在",150,130);
	}
}

$('input').focus(function(){
	$('.error').hide();
	$('.success').hide();
})

$('#logon').prop('disabled','true');
$('#logon').removeClass('btn-primary');
$('#sub_regist').prop('disabled','true');
$('#sub_regist').removeClass('btn-info');
$('input').on('input',function(){
	$('#logon').addClass('btn-primary');
	$('#logon').prop('disabled','');
	$('#sub_regist').addClass('btn-info');
	$('#sub_regist').prop('disabled','');
})
$('input').on('blur',function(){
	if (!$('#account').val() && !$('#password').val()) {
		$('#logon').removeClass('btn-primary');
		$('#logon').prop('disabled','true');
		if (!$('#password_re').val()) {
			$('#sub_regist').removeClass('btn-info');
			$('#sub_regist').prop('disabled','true');
		}
	}
})
})(jQuery);