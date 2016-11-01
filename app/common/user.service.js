//currently return 2 player objects
//in future will return constructor function 

(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('userService', userService);

		function userService() {
			var service = {
				constructor: User,
				player1: {
					isBlack: false,
					figures: []
				},
				player2: {
					isBlack: true,
					figures: []
				},
			};


			function User () {}
			
			return service;
		}
})();
