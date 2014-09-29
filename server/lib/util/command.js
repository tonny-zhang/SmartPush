var CONST_MISC = require('../../const/misc.json');

exports.parse = function(data){
	var result;
	if(data){
		data = data.toString();
	}
	
	if(data){
		var arr = data.split(CONST_MISC.DATE_SPLIT);
		result = {
			type: parseInt(arr[0])
		};
		if(arr.length == 2){
			try{
				result['packet'] = JSON.parse(arr[1]);
			}catch(e){}
		}
	}
	return result;
}
exports.param = function(type,packet){
	var paramArr = [type];
	if(packet){
		paramArr.push(JSON.stringify(packet));
	}
	return paramArr.join(CONST_MISC.DATE_SPLIT);
}