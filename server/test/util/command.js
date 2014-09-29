var command = require('../../lib/util/command');
var CONST_DATA_TYPE = require('../../const/socket_data_type');
var os = require('os');

console.log(command.param(CONST_DATA_TYPE.PING,{
	'c_num': 1,
	'mem_t': os.totalmem(),
	'mem_f': os.freemem()
}))