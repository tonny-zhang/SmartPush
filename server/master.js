var http = require('http'),
	url = require('url');

var Manager_Connect = require('./lib/Manager_Connect')

var CONST_MISC = require('./const/misc.json'),
	CONST_DATA_TYPE = require('./const/socket_data_type')
	MASTER_PORT = CONST_MISC.MASTER_PORT,
	MASTER_HOST = CONST_MISC.MASTER_HOST,
	MASTER_HTTP_HOST = CONST_MISC.MASTER_HTTP_HOST,
	MASTER_HTTP_PORT = CONST_MISC.MASTER_HTTP_PORT;

var client_stack = {};
var manager_connect = new Manager_Connect(MASTER_HOST,MASTER_PORT);
manager_connect.on(CONST_MISC.EVENT_COMMAND,function(data){
	var command = data.type,
		packet = data.packet;
	if(CONST_DATA_TYPE.REGIST == command){
		packet.n = 0;
		client_stack[data.key] = packet;
	}else if(CONST_DATA_TYPE.CLOSE == command){
		client_stack[data.key] = null;
		delete client_stack[data.key];
	}else if(CONST_DATA_TYPE.PING == command){
		client_stack[data.key].n = packet.c_num;
	}
});
function _show_stack(){
	var clients = manager_connect._client;
	var str = '';
	for(var i in clients){
		var client = clients[i];
		var cs = client_stack[i];
		if(cs){
			str += cs.host+'_'+cs.port+'(';
			if(client.length > 1 && client[1]){
				str += client[1].c_num;
			}
			str += ') ';
		}
		
	}
	console.log(manager_connect.getConnectsNum(),str);
	setTimeout(_show_stack,1000);
}
_show_stack();

function getConf(){
	var clients = manager_connect._client;
	var min_connect_num = null;
	var key_min_connect;
	
	// for(var i in clients){
	// 	var packet = clients[i][1];

	// 	c_num = packet.c_num;
	// 	if(min_connect_num == null || c_num < min_connect_num){
	// 		key_min_connect = i;
	// 		min_connect_num = c_num;
	// 	}
	// }
	// 由master临时管理slave上长连接数，再由slave的心跳数据不断修正（尽量保证平均分配）
	for(var i in client_stack){
		var n = client_stack[i].n;
		if(min_connect_num == null || n < min_connect_num){
			key_min_connect = i;
			min_connect_num = n;
		}
	}
	// console.log(key_min_connect,min_connect_num);
	if(key_min_connect){
		var result = client_stack[key_min_connect];
		result.n++;
	}
	return JSON.stringify(result||{});
}
function allotMsg(msg){
	manager_connect.sendMsgToClient(msg);
	return JSON.stringify({"code":"OK"});
}
function response(req, res,msg){
	if(!msg){
		res.writeHead(500);
	}
	var info = url.parse(req.url, true);
	var cb_name = info.query.cb;
	if (cb_name) {
		msg = cb_name + '('+msg+')';
	}
	res.end(msg);
}
function status(isStr){
	var clients = manager_connect._client;
	var result = [];
	for(var i in clients){
		var client = clients[i];
		var cs = client_stack[i];
		if(cs){
			var obj = {
				host: cs.host,
				port: cs.port,
				packet: client[1] || 0,
				last_time: client[2]
			}
			result.push(obj);
		}
	}
	return isStr? JSON.stringify(result):result;
}
http.createServer(function(req, res){
	var request_data = '';

	var req_obj = url.parse(req.url,true);

	var method = req.method.toLowerCase();
	var pathname = req_obj.pathname.replace(/\/$/,'');
	var result = '';
	if(method == 'get'){
		if(pathname == '/getconf'){
			result = getConf();
			response(req, res,result);
		}else if(pathname == '/status'){
			result = status(true);
			return response(req, res,result);
		}
		return response(req, res);	
	}else if(method == 'post' && pathname == '/msg'){
		req.on('data',function(d){
			request_data += d;
		}).on('end',function(){
			try{
				var param = JSON.parse(request_data);
			}catch(e){}
			
			if(param && param.msg){
				result = allotMsg(param.msg);
			}
			return response(req, res, result);
		});
	}
	
}).listen(MASTER_HTTP_PORT,MASTER_HTTP_HOST);
console.log('http runing',MASTER_HTTP_HOST,MASTER_HTTP_PORT);