var http = require('http'),
	net = require('net');

var Client = require('../../lib/Client');

var CONST_MISC = require('../../const/misc.json'),
	MASTER_HTTP_HOST = CONST_MISC.MASTER_HTTP_HOST,
	MASTER_HTTP_PORT = CONST_MISC.MASTER_HTTP_PORT;

var req = http.request({
	method: "POST",
	hostname: MASTER_HTTP_HOST,
	port: MASTER_HTTP_PORT,
	path: '/msg'
},function(res){
	res.setEncoding('utf8');
	var data = '';
	res.on('data',function(d){
		data += d.toString();
	}).on('end',function(){
		if(data){
			data = JSON.parse(data);
			console.log(data);

			new Client(data);
		}else{
			console.log('post msg fail');
		}
	});
});
var data = JSON.stringify({"msg":"test msg to everybody!"});
data = JSON.stringify({"msg":"other msg to everybody!"});
// data = 'test msg';
req.end(data);