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
var justLogin = {};
var onlineCount=0;
var restartCount=0;
var readyCount=0;
var currentUser;
var clearUnready=0;
var inGame=0;
function reload(obj){
	if(obj.passwd=="090238"){
		
 onlineUsers = {};
 restartUsers={};
 readyUsers = {};
 justLogin = {};
 onlineCount=0;
 restartCount=0;
 readyCount=0;
 currentUser="reload";
 inGame=0;	
	clearUnready=0;	
	}
}
function refreshData(){
	
	return {onlineUsers:onlineUsers,onlineCount:onlineCount,readyUsers:readyUsers,readyCount:readyCount,ReadyrestartCount:restartCount, user:currentUser}
}

io.on('connection', function(socket){
	
	//监听新用户加入
	socket.on('login', function(obj){
		if(inGame!=1){

		
		currentUser=obj;
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		
		
		if(!justLogin.hasOwnProperty(obj.userid)){
			justLogin[obj.userid]=obj.username;
		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers,onlineCount:onlineCount,readyUsers:readyUsers,readyCount:readyCount,user:obj});
		}
		else{
		io.emit('loginfailed', {user:obj});
			
		}
	});
	
	//监听玩家准备 
	socket.on('ready', function(obj){
		currentUser=obj;
		if(!readyUsers.hasOwnProperty(obj.userid)&&onlineUsers.hasOwnProperty(obj.userid)){
			readyUsers[obj.userid] = obj.username;
			readyCount++;
		io.emit('ready', {onlineUsers:onlineUsers,onlineCount:onlineCount,readyUsers:readyUsers,readyCount:readyCount,user:obj});
		if(readyCount==onlineCount&&onlineCount>=5)
			gameStart();

		}	
	});


		
	//监听玩家取消准备 
	socket.on('unready', function(obj){
				currentUser=obj;

		if(readyUsers.hasOwnProperty(obj.userid)){
			readyCount--;
			delete readyUsers[obj.userid];
		io.emit('unready', {onlineUsers:onlineUsers,onlineCount:onlineCount,readyUsers:readyUsers,readyCount:readyCount,user:obj});
		}
		
	});	
	
	
	//监听玩家重开
	socket.on('restart', function(obj){
				currentUser=obj;

		if(!restartUsers.hasOwnProperty(obj.userid)&&onlineUsers.hasOwnProperty(obj.userid)){
			restartUsers[obj.userid] = obj.username;
			restartCount++;
		if(restartCount>=onlineCount/2&&onlineCount>=5){
			restart();
			gameStart();

		}
		}	
	});		
		
	//监听玩家取消重开
	socket.on('unrestart', function(obj){
				currentUser=obj;

		if(restartUsers.hasOwnProperty(obj.userid)){
			
			restartCount--;
			delete restartUsers[obj.userid];
		}
		
	});	

	socket.on('reload', function(obj){
		reload(obj);
	});

	socket.on('kick', function(obj){

		if(clearUnready==0){
		io.emit('kick', refreshData());
		justLogin={};
		clearUnready=1;
		setTimeout(function(){	kickUnready();},6000);
		}
	});	
		//监听用户退出
	socket.on('disconnect', function(){
		removeUser(socket.name);
	});
	
});	
	function restart(){
		restartUsers={};
		restartCount=0;
		
		
	};
	
	function gameStart(){

		inGame=1;
		var randomChar=[];
			for(var i=0;i<onlineCount;i++){
				randomChar.push(character[i]);
			}
			if(onlineCount==8){
				randomChar.pop();
				randomChar.pop();
				randomChar.push("莫德雷德的爪牙");
				randomChar.push("亚瑟的忠臣");
			}
			if(onlineCount==9){
				randomChar=['梅林','派西维尔','亚瑟的忠臣','莫干娜','刺客','亚瑟的忠臣','莫德雷德','亚瑟的忠臣','亚瑟的忠臣'];
			}
			if(onlineCount==10){
				randomChar=['梅林','派西维尔','亚瑟的忠臣','莫干娜','刺客','亚瑟的忠臣','莫德雷德','亚瑟的忠臣','亚瑟的忠臣','奥伯伦'];

				
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
			
		io.emit('start', {onlineUsers:onlineUsers,character:randomChar});

	
	};



function removeUser(userid){
	

		
		if(readyUsers.hasOwnProperty(userid)){
			delete readyUsers[userid];
			readyCount--;
		}
		if(restartUsers.hasOwnProperty(userid)){
			delete restartUsers[userid];	
			restartCount--;
		}
		if(onlineUsers.hasOwnProperty(userid)) {
			//退出用户的信息
			var obj = {userid:userid, username:onlineUsers[userid]};
			currentUser=obj;
			//删除
			delete onlineUsers[userid];
			onlineCount--;
			
			if(onlineCount<5){
				inGame=0;
			}
			
		io.emit('logout',refreshData());

		}
};

function kickUnready(){
	clearUnready=0;
	for(var key in onlineUsers){
		var isReady=false;
		for(var key2 in readyUsers){
			if(key==key2)
			{
				isReady=true;
			}
		}
		for(var key3 in justLogin){
			if(key==key3)
				isReady=true;
		}
		
		if(!isReady){
			removeUser(key);
		}	
	}	
};
	

http.listen(3000, function(){
	console.log('listening on *:3000');
});