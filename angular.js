var app = angular.module('myApp', ['ngSanitize']);

app.factory('socket', function($rootScope) {
	var socket = io('http://localhost:3000');
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	}
});
app.controller('LinkController', function($scope, socket) {

	$scope.links = [];

	socket.on('init', function(data) {
		$scope.links = data.links;
	});

	socket.on('update:links', function(links) {
		console.log('updating links');
		$scope.links = links;
	});

});

app.controller('ChatController', function($scope, socket) {
	
	$scope.messages = [];

	socket.on('init', function(data) {
		$scope.messages = data.messages;
		$scope.users = data.users;
	});
	
	socket.on('send:message', function(message) {
		$scope.messages.push(message);
	});

	socket.on('change:name', function(message) {
		$scope.messages.push(message);
	});

	socket.on('user:join', function(data) {
		$scope.messages.push({
			user: 'chatroom',
			text: 'User ' + data.name + ' has joined.'
		});
		$scope.users.push(data.name);
	});

	socket.on('user:left', function(data) {
		$scope.messages.push({
			user: 'chatroom',
			text: 'User ' + data.name + ' has left'
		});
		var user;
		for (var i = 0; i < $scope.users.length; i++) {
			user = scope.users[i];
			if (user === data.name) {
				$scope.users.splice(i, 1);
				break;
			}
		};
	});

	$scope.changeName = function () {

		var textStart = $scope.name == undefined ? 'New user' : 'User ' + $scope.name;

		socket.emit('change:name', {
		  name: $scope.newName,
		  message : {
		  	user: 'SERVER',
		  	text: textStart + ' is now known as ' + $scope.newName
		  }
		});
	
    	$scope.messages.push({
			user: 'SERVER',
			text: 'You are now known as ' + $scope.newName
		});

	    $scope.name = $scope.newName;
	    $scope.newName = '';

	};

	$scope.sendMessage = function () {
		socket.emit('send:message', {
		  text: $scope.message,
		  user: $scope.name
		});

		$scope.messages.push({
		  user: $scope.name,
		  text: $scope.message
		});

		$scope.message = '';
	};
});