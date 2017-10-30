var usr_width= 720;
var	usr_height= 1080;
var naturalWidth,
naturalHeight;
var typeIdentify= function(file){
	if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
		alert('请上传图片文件');
	}
};
var getImgData = function(src){
	var img = document.createElement('img');
	img.style.visibility = "hidden";
	img.src = src;
	naturalWidth = img.width;
	naturalHeight = img.height;
}
var dataURItoBlob= function(dataURI){
    // convert base64 to raw binary data held in a string 
    var byteString 
    ,mimestring;

    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
    	byteString = atob(dataURI.split(',')[1]);
    } else {
    	byteString = decodeURI(dataURI.split(',')[1]);
    }

    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var content = new Array();
    for (var i = 0; i < byteString.length; i++) {
    	content[i] = byteString.charCodeAt(i);
    }

    return new Blob([new Uint8Array(content)], {type: mimestring});
};
var compress= function(src,width,height,quality,callback) {
	getImgData(src);
	if (width > 0) {
		usr_width = width;
	} else {
		usr_width = naturalWidth;
	}
	if (height > 0) {
		usr_height = height;
	} else {
		usr_height = naturalHeight;
	}

	// if(usr_width > naturalWidth) {
	// 	usr_height = usr_height * naturalWidth/usr_width;
	// 	usr_width = naturalWidth;
	// } else {
	// 	usr_height = usr_height * naturalWidth/usr_width;
	// }
	var mime_type = "image/jpeg";
	var cvs = document.createElement('canvas');
	var image = new Image();
	image.src = src;
	image.onload = function(){
		var cxt = cvs.getContext('2d');
		cvs.width = usr_width;
		cvs.height = usr_height;
		cxt.drawImage(image,0,0);
		var newImageSrc = cvs.toDataURL(mime_type,quality/100);
		var blob = dataURItoBlob(newImageSrc);
		callback(blob);
	}
};
var ImageCompress = {
	isCanvasSuppotred: function(){
		var ele = docunment.createElement('canvas');
		return !!(ele.getContext && ele.getContext('2d'));
	},
	DoAll: function(files,width,height,quality,callback) {
		var fileCount = files.length;
		var ret = [];

		for (var i = 0; i<files.length;i++) {
		//typeIdentify(file);
		var fReader = new FileReader();
		fReader.onload = function(e){
			var result = e.target.result;
			compress(result,width,height,quality,function(file){
				file && ret.push(file);
				fileCount--;
				if (fileCount <=0) {
					callback && callback(ret);
				}
			})
		}
		fReader.readAsDataURL(files[i]);
	}
}
}
