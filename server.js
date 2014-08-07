var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var users = {};
var links = [];

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/angular.js', function(req, res) {
	res.sendfile(__dirname + '/angular.js');
});

app.get('/styles.css', function(req, res) {
        res.sendfile(__dirname + '/styles.css');
});


io.on('connection', function(socket) {
	
	users[socket.id] = {
		name: socket.id,
		coords: {},
		id: socket.id
	}
	console.log('user connected');
	console.log(Object.keys(users).length);
	
	socket.emit('init', {
		messages: messages,
		links: links,
		name: socket.id
	});

	socket.on('send:message', function(message) {
		var linksAdded = parseUrls(message.text, message.user);
		message.timestamp = new Date();
		message.timestampString = message.timestamp.getUTCHours() + ':' + message.timestamp.getUTCMinutes() + ' ';
		console.log(message.timestampString + message.user + ': ' + message.text);
		socket.broadcast.emit('send:message', message);
		if (linksAdded) {
			io.emit('update:links', links);
		}
		messages.push(message);
	});

	socket.on('change:name', function(data) {

		users[data.userId] = {
			name: data.name,
		}

		socket.broadcast.emit('change:name', data.message);
		messages.push(data.message);
	});

	socket.on('update:location', function(data) {
		
		console.log(users);
		console.log(data);	
		if (users[data.userId]) {
			users[data.userId].coords = data.coords;
		}
		console.log(users[data.userId]);
		console.log('sending users: ');
		io.emit('update:users', users);
	});

	socket.on('disconnect', function() {
		
		delete users[socket.id];
		io.emit('update:users', users);
		console.log('user disconnected');
		console.log(Object.keys(users).length);
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
		return true;
	}
	return false;
}

http.listen('10967', function() {
	console.log('listening on :3000');
});
