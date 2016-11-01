(function () {
	'use strict';
	angular.module('chessApp.common')
		.service('boardService', boardService);

		function boardService () {
			var service = {
				constructor: Board
			};

			return service;

			function Board () {}
		}
})();
