var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var users = [];
var links = [];

app.get('/', function(req, res) {
	res.sendfile('index.html');
});

io.on('connection', function(socket) {
	console.log('user connected');
	socket.emit('init', {
		messages: messages,
		links: links
	});
	socket.on('send:message', function(message) {
		parseUrls(message.text, message.user);
		console.log(message.user + ': ' + message.text);

		socket.broadcast.emit('send:message', message);
		io.emit('update:links', links);
		messages.push(message);
	});
	socket.on('change:name', function(data) {
		socket.broadcast.emit('change:name', data.message);
		messages.push(data.message);
	});
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

var parseUrls = function(text, user) {
	var regex = /\b(http|https)(\S*)/g;
	var results = text.match(regex);
	
	if (results) {
		for (var i = 0; i < results.length; i++) {
			var result = results[i];
			links.push({
				url: result,
				user: user
			});
				
		};	
	}
}

http.listen('3000', function() {
	console.log('listeing on :3000');
});