var http = require('http'),
	net = require('net');

var Client = require('../../lib/Client');

var CONST_MISC = require('../../const/misc.json'),
	CONST_DATA_TYPE = require('../../const/socket_data_type'),
	MASTER_HTTP_HOST = CONST_MISC.MASTER_HTTP_HOST,
	MASTER_HTTP_PORT = CONST_MISC.MASTER_HTTP_PORT;

for(var i = 0 ;i<100;i++){
	var req = http.get({
		hostname: MASTER_HTTP_HOST,
		port: MASTER_HTTP_PORT,
		path: '/getconf'
	},function(res){
		res.setEncoding('utf8');
		var data = '';
		res.on('data',function(d){
			data += d.toString();
		}).on('end',function(){
			if(data){
				data = JSON.parse(data);
				console.log(data);

				var client = new Client(data);
				client.on(CONST_MISC.EVENT_COMMAND,function(data){
					var command = data.type;
					if(CONST_DATA_TYPE.PUSH == command){
						console.log(data);
					}
				});
			}else{
				console.log('get conf fail');
			}
		});
});
}