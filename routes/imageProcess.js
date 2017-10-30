var imageProcess = function(){

};

module.exports = imageProcess;

/**
* 利用canvas压缩图片
*/
imageProcess.compress = function(image,quality,outputType,callback) {
	
	var mine_type = 'image/jpeg';
	if (outputType !=undefined && outputType == 'png') {
		mine_type = 'image/png';
	}

	var cvs = document.createElement('canvas');
	cvs.width = image.naturalWidth;
	cvs.height = image.naturalHeight;
	var ctx = cvs.getContext('2d').drawImage(image,0,0);
	var newImageData = cvs.toDataURL(mine_type,quality/100);
	var outputImage = new Image();
	outputImage.src = newImageData;
	callback(outputImage);
};