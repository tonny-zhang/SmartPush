var net = require('net');

var getKey = require('../../lib/util/socket').getKey;
var CONST_MISC = require('../../const/misc.json'),
	CONST_DATA_TYPE = require('../../const/socket_data_type'),
	command_param = require('../../lib/util/command').param;

var MASTER_PORT = CONST_MISC.MASTER_PORT,
	MASTER_HOST = CONST_MISC.MASTER_HOST;
var client = new net.Socket();
client.on('data',function(d){
	
});
client.connect(MASTER_PORT,MASTER_HOST, function(){
	console.log('connected server!');
});
console.log(getKey(client));