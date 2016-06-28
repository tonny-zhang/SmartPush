# 长连接分布式线性扩展解决方案

# 目录说明

# server.master 

	1. 负责分配客户端实际连接的长连接服务器

	2. 负责分配消息分配

# server.slave 

	1. 负责长连接的保持及和master的心跳检测


-------------
# 测试
1. node server/master
1. node server/slave 3001  //启动一个slave
1. node server/slave 3002  //启动第二个slave
1. node server/test/client/client // 模拟多个客户端
1. node server/test/client/post_msg //模板向客户端发送数据

## 服务器状态查看
monitor/server.html
