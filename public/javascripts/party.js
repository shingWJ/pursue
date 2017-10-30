(function($) {
	var widow_width = window.innerWidth;
	var cvs = $('#headCav')[0];
	var image = new Image();
	cvs.width = window.innerWidth;
	cvs.height = window.innerWidth*cvs.height/cvs.width;
	image.src = '/images/2rdParty.jpg';
	image.onload = function(){
		var cxt = cvs.getContext('2d');
		cxt.drawImage(image,0,0,window.innerWidth,window.innerWidth*cvs.height/cvs.width);
	}
	$('#sub_enrty').click(function(){
		var name = $('#name').val();
		if (!name) {
			alert('姓名都不输，我们可不带你玩哦。。。');
			return;
		}
		var entryData = {
			name : $('#name').val(),
			phoneNO : $('#phoneNO').val(),
			entryCount: $('#entryCount').val(),
			placeAdvice: $('#placeAdvice').val(),
			tasteFavor: $('#tasteFavor').val(),
			suitableTime: $('#suitableTime').val()
		}
		$.post('/entry',entryData,function(){
			window.location.href = '/party';
		})
	});
	
})(jQuery);