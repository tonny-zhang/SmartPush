var net = require('net');

var client = new net.Socket();
client.on('data',function(d){
	console.log(" receive->"+d.toString());
	// client.destroy();
});
client.connect(3000,'localhost', function(){
	console.log('connected server!');
});
client.write(' ');