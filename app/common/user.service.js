(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('userService', userService);

		function userService() {
			var service = {
				constructor: User
			};

			return service;

			function User () {}
		}
})();
