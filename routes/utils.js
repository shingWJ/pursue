String.prototype.replaceAll = function(str1,str2){
	return this.replace(new RegExp(str1,"gm"),str2);
}