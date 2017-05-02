var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.send('<h1>Welcome Realtime Server</h1>');
});

var character=['梅林','派西维尔','亚瑟的忠臣','莫干娜','刺客','亚瑟的忠臣','奥伯伦','亚瑟的忠臣'];




var onlineUsers = {};
var restartUsers={};
var readyUsers = {};

var onlineCount=0;
var restartCount=0;
var readyCount=0;

io.on('connection', function(socket){
	console.log('a user connected');
	
	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;

		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});
		console.log(obj.username+'加入了游戏');
	});
	
	//监听玩家准备 
	socket.on('ready', function(obj){
		console.log("one man ready");
		if(!readyUsers.hasOwnProperty(obj.userid)){
			readyUsers[obj.userid] = obj.username;
			console.log(readyUsers);
			readyCount++;
		io.emit('ready',{readyUsers:readyUsers,readyCount:readyCount,username:obj.username});
		if(readyCount==onlineCount&&onlineCount>=5)
			gameStart();
		
		
		
		
		}	
	});


		
	//监听玩家取消准备 
	socket.on('unready', function(obj){
		console.log("one man unready");
		if(readyUsers.hasOwnProperty(obj.userid)){
			
					console.log("he is in");
			readyCount--;
			delete readyUsers[obj.userid];
			console.log(readyUsers);
			console.log(readyCount);
		io.emit('unready',{readyUsers:readyUsers,readyCount:readyCount,username:obj.username});
		}
		
	});	
	
	
	//监听玩家重开
	socket.on('restart', function(obj){
		console.log("one man restart");
		if(!restartUsers.hasOwnProperty(obj.userid)){
			restartUsers[obj.userid] = obj.username;
			console.log(restartUsers);
			restartCount++;
		if(restartCount>=onlineCount/2)
			console.log("restart!!!");
		}	
	});		
		
	//监听玩家取消准备 
	socket.on('unrestart', function(obj){
		console.log("one man unrestart");
		if(restartUsers.hasOwnProperty(obj.userid)){
			
			readyCount--;
			delete restartUsers[obj.userid];
			console.log(restartUsers);
		}
		
	});	
	
	
	
	function gameStart(){
		
		var randomChar=[];
			for(var i=0;i<onlineCount;i++){
				randomChar.push(character[i]);
			}
			
			//之后洗身份
			for(var i=0;i<100;i++){
				for(var j=0;j<readyCount;j++){
					var sw=Math.floor(Math.random()*readyCount);
					var temp=randomChar[j];
					randomChar[j]=randomChar[sw];
					randomChar[sw]=temp;
				}
			}
			
		console.log(randomChar);
		console.log("game start");
		io.emit('start', {onlineUsers:onlineUsers,character:randomChar});

	
	}

	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			io.emit('logout', {onlineUsers:onlineUsers, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
		
		if(readyUsers.hasOwnProperty(socket.name)){
			delete readyUsers[socket.name];	
		}
		if(restartUsers.hasOwnProperty(socket.name)){
			delete restartUsers[socket.name];	
		}	
	});
	
	
	
	
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});
  
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});