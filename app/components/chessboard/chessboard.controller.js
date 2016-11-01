(function() {
	'use strict';
	angular.module('chessApp')
		.controller('MainCtrl', MainCtrl);

	MainCtrl.$inject = ['figureService', 'boardService', 'userService'];
	
	function MainCtrl(figureService, boardService, userService) {
		var vm = this;

	}
})();

