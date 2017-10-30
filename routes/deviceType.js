function Device() {

}

module.exports = Device;

Device.getType = function(req){
	var deviceAgent = req.headers["user-agent"].toLowerCase();
	var type = "";
	if (deviceAgent.match(/(iphone|ipod|ipad|android)/)) {
		type = 'mobile';
	} else {
		type = 'pc';
	}
	return type;
};