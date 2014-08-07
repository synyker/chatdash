var app = angular.module('myApp', ['ngSanitize', 'ngMap']);

app.factory('socket', function($rootScope) {
	var socket = io('http://192.96.201.109:10967');
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

app.factory('gmap', function($rootScope) {

	var options = {
		zoom : 13,
		center : new google.maps.LatLng(60.2, 24.9),
		mapTypeId : google.maps.MapTypeId.ROADMAP		
	};

	return new google.maps.Map($('#map')[0], options);

});

app.controller('MapController', function($scope, gmap, socket) {

	$scope.markers = [];
	$scope.users = [];
	$scope.map = gmap;
	$('#map').show();

	$scope.lat = 60.2;
	$scope.lon = 24.9;

	socket.on('update:users', function(users) {
		
		console.log('updating users');
		$scope.users = users;

		for (var i = 0; i < $scope.markers.length; i++) {
			$scope.markers[i].setMap(null);
		};
		$scope.markers = [];

		for (var key in $scope.users) {
			var user = $scope.users[key];
			console.log(user);
			console.log(user.coords.lat);
			console.log(user.coords.lon);

			var center = new google.maps.LatLng(user.coords.lat, user.coords.lon)

			$scope.markers.push(new google.maps.Marker({
				map: $scope.map,
				position: center,
				title: user.name,
				draggable: true
			}));

			if (user.id === $scope.userId) {
				$scope.map.panTo(center);
			}
		}
	});

	var updateLocation = function() {
  		navigator.geolocation.getCurrentPosition(function(position){
  			console.log($scope.userId);
			$scope.$apply(function(){
				console.log(position);
	        	$scope.lat = position.coords.latitude;
	        	$scope.lon = position.coords.longitude;
	        	socket.emit('update:location', {
	        		user: $scope.name,
	        		userId: $scope.userId,
	        		coords: {
	        			lat: $scope.lat, 
	        			lon: $scope.lon 
	        		}
	        	});
      		});
	    });
  	}

	if (navigator.geolocation) {
		updateLocation();
  	}
	
});

app.controller('LinkController', function($scope, socket) {

	$scope.links = [];

	socket.on('init', function(data) {
		$scope.links = data.links;
	});

	socket.on('update:links', function(links) {
		console.log('updating links');
		console.log(links);
		$scope.links = links;
	});

});

app.controller('ChatController', function($rootScope, $scope, $anchorScroll, $location, socket) {
	
	$scope.messages = [];

	socket.on('init', function(data) {
		$scope.messages = data.messages;
		$scope.users = data.users,
		$rootScope.name = data.name,
		$rootScope.userId = data.name
	});
	
	socket.on('send:message', function(message) {
		$scope.messages.push(message);
		$location.hash('bottom');
		$anchorScroll();
		
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
		  oldName: $scope.name,
		  userId: $scope.userId,
		  message : {
		  	user: 'SERVER',
		  	text: textStart + ' is now known as ' + $scope.newName
		  }
		});
	
    	$scope.messages.push({
			user: 'SERVER',
			text: 'You are now known as ' + $scope.newName
		});

	    $rootScope.name = $scope.newName;
	    $scope.newName = '';

	};

	$scope.sendMessage = function () {
		socket.emit('send:message', {
		  text: $scope.message,
		  user: $scope.name
		});

		var timestamp = new Date();
		var timestampString = timestamp.getUTCHours() + ':' + timestamp.getUTCMinutes() + ' ';
		$scope.messages.push({
		  user: $scope.name,
		  text: $scope.message,
		  timestamp: timestamp,
		  timestampString: timestampString
		});

		var messages = $('#messages');
		var height = messages[0].scrollHeight - messages.height();

		messages.stop().animate({ scrollTop: height }, 'fast');

		$scope.message = '';
	};
});
