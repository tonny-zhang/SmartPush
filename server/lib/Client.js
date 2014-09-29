var net = require('net'),
	os = require('os'),
	EventEmitter = require("events").EventEmitter,
	util = require('util');
var CONST_DATA_TYPE = require('../const/socket_data_type'),
	CONST_MISC = require('../const/misc.json'),
	command_param = require('./util/command').param,
	command_parse = require('./util/command').parse;

function Client(master,fn_registed_packet,fn_ping_packet){
	var _this = this;
	var client = new net.Socket();
	client.isConnected = false;
	client.isRegisted = false;
	client.on('error',function(d){
		client.isConnected = false;
		client.isRegisted = false;
	});
	client.on('connect',function(){
		client.isConnected = true;
		console.log('connected server!',client.address(),arguments);
	});
	client.on('data',function(d){
		var result = command_parse(d);
		if(result.type == CONST_DATA_TYPE.RESULT_OK){
			client.isRegisted = true;
		}
		_this.emit(CONST_MISC.EVENT_COMMAND,result);
	});
	
	function send(type,packet){
		client.write(command_param(type,packet));
	}
	var ping_tt;
	function ping(){
		clearTimeout(ping_tt);
		if(client.isConnected){
			if(!client.isRegisted){
				var packet = fn_registed_packet && fn_registed_packet();
				send(CONST_DATA_TYPE.REGIST,packet);
			}else{
				var packet = fn_ping_packet && fn_ping_packet();
				send(CONST_DATA_TYPE.PING,packet);
			}
		}else{
			client.connect(master.port,master.host);
		}
		ping_tt = setTimeout(ping,CONST_MISC.PING_DELAY);
	}
	ping();
	// _this.ping = ping();
}
util.inherits(Client,EventEmitter);
module.exports = Client;