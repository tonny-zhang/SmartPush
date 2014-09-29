exports.getKey = function(socket){
	if(socket){
		return [socket.remoteAddress,socket.remotePort].join('_');
	}
	
}