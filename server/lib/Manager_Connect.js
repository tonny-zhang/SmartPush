var net = require('net'),
	EventEmitter = require("events").EventEmitter,
	util = require('util'),
	getSocketKey = require('./util/socket').getKey,

	CONST_MISC = require('../const/misc.json'),
	CONST_DATA_TYPE = require('../const/socket_data_type'),
	command_param = require('./util/command').param
	command_parse = require('./util/command').parse;

function _on_connect(){
	console.log('_on_connect');
}
function _on_data(data){
	var result = command_parse(data);
	if(result){
		var _this = this;
		var key = getSocketKey(_this);
		var type = result.type;
		var packet = result.packet;
		result.key = key;
		manager_connect_stack[this._mc_id].emit(CONST_MISC.EVENT_COMMAND,result);

		if(CONST_DATA_TYPE.PING == type){
			changePingData(_this._mc_id,key,packet);
		}
		_this.write(command_param(CONST_DATA_TYPE.RESULT_OK));
	}
}
function _on_end(){
	console.log('_on_end');
	closeSocket(this);
}
function _on_timeout(){
	console.log('_on_timeout');
	closeSocket(this);
}
function _on_error(){
	console.log('_on_error');
	closeSocket(this);
}
function _on_close(){
	console.log('_on_close');
	closeSocket(this);
}
function closeSocket(socket){
	manager_connect_stack[socket._mc_id]._rmClient(socket);
	manager_connect_stack[socket._mc_id].emit(CONST_MISC.EVENT_COMMAND,command_param(CONST_DATA_TYPE.CLOSE,{
		key: socket._key
	}));
}

function bindClientSocket(socket){
	var _this = this;
	var key = getSocketKey(socket);
	socket._key = key;
	
	socket.on('connect',_on_connect);
	socket.on('data',_on_data);
	socket.on('end',_on_end);
	socket.on('timeout',_on_timeout);
	socket.on('error',_on_error);
	socket.on('close',_on_close);
	_this._addClient(socket);
}

var manager_connect_stack = {};
var manager_connect_id = 0;
function changePingData(mc_id, socket_key, packet){
	var pingData = manager_connect_stack[mc_id]['_client'][socket_key];
	pingData[1] = packet;
	pingData[2] = new Date().getTime();
}
function Manager_Connect(host,port){
	var _this = this;
	_this._id = manager_connect_id++;
	manager_connect_stack[_this._id] = _this;
	_this._client = {};
	_this._client_len = 0;
	var master = net.createServer(function(socket){
		bindClientSocket.call(_this,socket);
	});
	master.listen(port,host);
	console.log('Manager_Connect listen',host,port);
}
function sendMsg(socket,msg){
	if(socket){
		socket.write(command_param(CONST_DATA_TYPE.PUSH,{msg: msg}));
	}
}
util.inherits(Manager_Connect,EventEmitter);
var _prop = Manager_Connect.prototype;
_prop._bindTimeout = function(socket){
	var _this = this;
	var key = socket._key;
	setTimeout(function(){
		var key = socket._key;
		var val = _this._client[key];
		if(!val || val.length != 3 || new Date().getTime()-val[2] > CONST_MISC.PING_TIMEOUT){
			_this._rmClient(socket);
		}else{
			_this._bindTimeout(socket);
		}
	},CONST_MISC.PING_TIMEOUT);
}
_prop._addClient = function(socket){
	var _this = this;
	socket._mc_id = _this._id;
	var key = socket._key;
	if(!_this._client[key]){
		_this._client[key] = [socket,null,new Date().getTime()];
		_this._client_len++;
		_this._bindTimeout(socket);
	}
	// _this.emit(CONST_MISC.EVENT_COMMAND,command_param(CONST_DATA_TYPE.PING,{
	// 	key: socket._key
	// }));
}
_prop._rmClient = function(socket){
	var _this = this;
	var key = socket._key;
	if(_this._client[key]){
		_this._client[key] = null;
		delete _this._client[key];
		_this._client_len--;
	}
}
_prop.getConnectsNum = function(){
	return this._client_len;
}
_prop.sendMsgToClient = function(msg,socket){
	var _this = this;
	if(!socket){
		var clients = _this._client;
		for(var i in clients){
			sendMsg(clients[i][0],msg);
		}
	}else{
		sendMsg(socket,msg);
	}
}


module.exports = Manager_Connect;