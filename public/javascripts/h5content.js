(function($){
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext('2d');
	var image = new Image();
	$('#img').change(function(){
		if (!ImageCompress.isCanvasSuppotred) {
			alert('浏览器不支持，请安装chrome或者firefox浏览器');
		}
		ImageCompress.DoAll(this.files,720,1280,100,function(src){
			$('#img_draw').attr('src',window.URL.createObjectURL(src[0]));
			console.log(src);
			var formData = new FormData();
			formData.append('file',src[0]);
			$.ajax({
				type: 'post',
				url: '/upload',
				processData: false,
				contentType: false,
				cache: false,
				data: formData,
				success: function(data){
					// alert(data);
					$('#imagesrc').val(data);
					image.src = '/files/'+data;
					image.onload = function(){
						ctx.save();
						ctx.scale(0.5,0.5);
						ctx.drawImage(image,0,0,720,1280);
						ctx.save();
					}
				}
			})
		})
	});

	var poetryWrite = function() {
		$('#fontFamily').val($('#font_family option:selected').val());
		ctx.clearRect(0,0,240,320);
		ctx.drawImage(image,0,0);
		// ctx.restore();
		// ctx.save();
		var poetryContent = $('#poetry').val();
		var poetries = poetryContent.split(';');
		var x = !$('#x').val()? 0: parseInt($('#x').val());
		var y = !$('#y').val()? 0: parseInt($('#y').val());
		var fontcolor = !$('#fontcolor').val()? '#333': $('#fontcolor').val();
		var font_family = !$('#fontFamily').val()? 'sans-serif': $('#fontFamily').val();
		ctx.font="40px " + font_family;
		ctx.fillStyle=fontcolor;
		for(var i=0;i<poetries.length;i++) {
			ctx.fillText(poetries[i],x,y + i*30);
		}
	}

	$('input').on('input',poetryWrite);
	$('input').on('change',poetryWrite);
	$('select').on('change',poetryWrite);
})(jQuery);