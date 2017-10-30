function MiniVideo(miniVideo) {
	this.x = miniVideo.x;
	this.y = miniVideo.y;
	this.width = miniVideo.width;
	this.heigth = miniVideo.heigth;
	this.videoUrl = miniVideo.videoUrl;
	this.tagName = miniVideo.tagName;
}

MiniVideo.prototype.create = function(){
	var video = '<video style="top:'+this.y+';left:'+this.x+';heigth:'+this.heigth+';width:'+this.width+'" src="'+this.url+'" controls="controls"></video>';
	document.getElementById(this.tagName).innerHTML = video;
}