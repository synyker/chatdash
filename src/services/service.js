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

app.factory('gmap', function($rootScope) {

	var options = {
		zoom : 13,
		center : new google.maps.LatLng(60.2, 24.9),
		mapTypeId : google.maps.MapTypeId.ROADMAP		
	};

	return new google.maps.Map($('#map')[0], options);

});