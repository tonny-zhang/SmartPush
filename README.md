# 长连接分布式线性扩展解决方案

# 目录说明

# server.master 

	1. 负责分配客户端实际连接的长连接服务器

	2. 负责分配消息分配

# server.slave 

	1. 负责长连接的保持及和master的心跳检测