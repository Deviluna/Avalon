﻿(function () {
	var d = document,
	w = window,
	p = parseInt,
	dd = d.documentElement,
	db = d.body,
	dc = d.compatMode == 'CSS1Compat',
	dx = dc ? dd: db,
	ec = encodeURIComponent;
	
	
	w.CHAT = {
		msgObj:d.getElementById("message"),
		screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
		username:null,
		userid:null,
		socket:null,
		userchar:null,
		allchar:{},
		//让浏览器滚动条保持在最低部
		scrollToBottom:function(){
			w.scrollTo(0, this.msgObj.clientHeight);
		},
		//退出，本例只是一个简单的刷新
		logout:function(){
			//this.socket.disconnect();
			location.reload();
		},
		//提交聊天消息内容
		submit:function(){
			var content = d.getElementById("content").value;
			if(content != ''){
				var obj = {
					userid: this.userid,
					username: this.username,
					content: content
				};
				this.socket.emit('message', obj);
				d.getElementById("content").value = '';
			}
			return false;
		},
		genUid:function(){
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},
		//更新系统消息，本例中在用户加入、退出的时候调用
		

		
		
		updateSysMsg:function(o, action){
			
			
			//添加系统消息
			if(action=="ready"){
			var readyUsers=o.readyUsers;
				var html = '';
			html += '<div class="msg-system">';
			html += o.username;
			html += '已准备';
			html += '</div>';
			var section = d.createElement('section');
			section.className = 'system J-mjrlinkWrap J-cutMsg';
			section.innerHTML = html;
			this.msgObj.appendChild(section);	
			this.scrollToBottom();
				
			}
			else if(action=="unready"){
			console.log("acc unready");
			var html = '';
			html += '<div class="msg-system">';
			html += o.username;
			html += '取消准备';
			html += '</div>';
			var section = d.createElement('section');
			section.className = 'system J-mjrlinkWrap J-cutMsg';
			section.innerHTML = html;
			this.msgObj.appendChild(section);	
			this.scrollToBottom();

			}
			else if(action=="message"){
				console.log(o);
			}
			else if(action=="start"){
				d.getElementById("gamebox").style.display = 'none';
				d.getElementById("start").style.display = 'block';
				console.log(o.onlineUsers);
				console.log(o.character);
				console.log(this.userid);
				var i=0;
				for(var key in o.onlineUsers){
					this.allchar[o.onlineUsers[key]]=o.character[i];
					if(key==this.userid){
						
						this.userchar=o.character[i];
						d.getElementById("character").innerHTML=this.userchar;
						
						
					}
					i++;
				}
				console.log(this.allchar);
										var info=""

				if(this.userchar=="梅林"){
					for(var key in this.allchar){
						if(this.allchar[key]=="莫干娜"||this.allchar[key]=="刺客"||this.allchar[key]=="奥伯伦"){
							info+=key+"<br>";
						}
					}
											info+="都是坏人";
				}
				
				if(this.userchar=="派西维尔"){
					for(var key in this.allchar){
						if(this.allchar[key]=="莫干娜"||this.allchar[key]=="梅林"){
							info+=key+"<br>";
						}
					}
											info+="可能是梅林";
				}				
				
				
				if(this.userchar=="莫干娜"){
					for(var key in this.allchar){
						if(this.allchar[key]=="刺客"){
							info+=key+"<br>";
						}
					}
											info+="是刺客";
				}							
				
				if(this.userchar=="刺客"){
					for(var key in this.allchar){
						if(this.allchar[key]=="莫干娜"){
							info+=key+"<br>";
						}
					}
											info+="是莫干娜";
				}


				if(this.userchar=="亚瑟的忠臣"){

					info+="你是萌萌哒的忠臣，所以你什么都不知道";
				}
				d.getElementById("uname").innerHTML=this.username;
				d.getElementById("info").innerHTML=info;
				
			}
			else{
				
				
			//当前在线用户列表
			var onlineUsers = o.onlineUsers;
			//当前在线人数
			var user = o.user;
			var onlineCount=o.onlineCount;
			//更新在线人数
			var userhtml = '';
			var separator = '';
			for(key in onlineUsers) {
		        if(onlineUsers.hasOwnProperty(key)){
					userhtml += separator+onlineUsers[key];
					separator = '、';
				}
		    }
			d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
				
				
			
			var html = '';
			html += '<div class="msg-system">';
			html += user.username;
			html += (action == 'login') ? ' 加入了游戏' : ' 退出了游戏';
			html += '</div>';
			var section = d.createElement('section');
			section.className = 'system J-mjrlinkWrap J-cutMsg';
			section.innerHTML = html;
			this.msgObj.appendChild(section);	
			this.scrollToBottom();
			}
		},
		
		//玩家准备开始游戏
		ready:function(){
			var readyButton=d.getElementById("ready");
			var readyText=readyButton.value;
			if(readyText == "准备"){
				this.socket.emit('ready', {userid:this.userid, username:this.username});
				readyButton.value='取消准备';
			}
			else{
				this.socket.emit('unready', {userid:this.userid, username:this.username});

				readyButton.value="准备";
			}
		},
		restart:function(){
		var restartButton=d.getElementById("restart");
		var restartText=restartButton.value;
		if(restartText=="重新开始"){
			
			this.socket.emit('restart', {userid:this.userid, username:this.username});
				restartButton.value='取消重开';
		}
		else{
				this.socket.emit('unrestart', {userid:this.userid, username:this.username});
				restartButton.value="重新开始";
		}			
		},
		
		
		
		//第一个界面用户提交用户名
		usernameSubmit:function(){
			var username = d.getElementById("username").value;
			if(username != ""){
				console.log("start game");
				d.getElementById("username").value = '';
				d.getElementById("loginbox").style.display = 'none';
				d.getElementById("gamebox").style.display = 'block';
				this.init(username);
			}
			return false;
		},
		init:function(username){
			/*
			客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
			实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
			*/
			this.userid = this.genUid();
			this.username = username;
			
	
			
			//连接websocket后端服务器
			this.socket = io.connect('ws://120.77.248.40:3000');
			
			//告诉服务器端有用户登录
			this.socket.emit('login', {userid:this.userid, username:this.username});
			
			//监听新用户登录
			this.socket.on('login', function(o){
				CHAT.updateSysMsg(o, 'login');	
			});
			
			this.socket.on('ready', function(o){
				CHAT.updateSysMsg(o, 'ready');	
			});

			this.socket.on('unready', function(o){
				CHAT.updateSysMsg(o, 'unready');	
			});
			
			this.socket.on('start', function(o){
				CHAT.updateSysMsg(o, 'start');	
			});

			
			
			//监听用户退出
			this.socket.on('logout', function(o){
				CHAT.updateSysMsg(o, 'logout');
			});
			
			//监听消息发送
			this.socket.on('message', function(o){
				CHAT.updateSysMsg(o, 'message');

			});

		}
	};
	//通过“回车”提交用户名
	d.getElementById("username").onkeydown = function(e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.usernameSubmit();
		}
	};

})();