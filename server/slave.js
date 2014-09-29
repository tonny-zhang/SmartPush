var net = require('net'),
	os = require('os'),
	Manager_Connect = require('./lib/Manager_Connect')
	Client = require('./lib/Client');

var CONST_MISC = require('./const/misc.json'),
	CONST_DATA_TYPE = require('./const/socket_data_type'),
	command_param = require('./lib/util/command').param,
	command_parse = require('./lib/util/command').parse;

var SLAVE_HOST = CONST_MISC.SLAVE_HOST,
	SLAVE_PORT = CONST_MISC.SLAVE_PORT,
	MASTER_HOST = CONST_MISC.MASTER_HOST,
	MASTER_PORT = CONST_MISC.MASTER_PORT;;

var args = process.argv;
if(args.length > 2){
	var port = parseInt(args[2]);
}else{
	var port = SLAVE_PORT;
}

var manager_connect = new Manager_Connect(SLAVE_HOST,port);

var client = new Client({
	host: MASTER_HOST,
	port: MASTER_PORT
},function(){
	return {
		host: SLAVE_HOST,
		port: port
	}
},function(){
	return {
		'mem_t': os.totalmem(),
		'mem_f': os.freemem(),
		'c_num': manager_connect.getConnectsNum()
	}
});
client.on(CONST_MISC.EVENT_COMMAND,function(data){
	var command = data.type,
		packet = data.packet;
	if(CONST_DATA_TYPE.PUSH == command){
		manager_connect.sendMsgToClient(JSON.stringify(packet));
	}
});