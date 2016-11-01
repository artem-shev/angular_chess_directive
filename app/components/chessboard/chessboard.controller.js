(function() {
	'use strict';
	angular.module('chessApp')
		.controller('MainCtrl', MainCtrl);

	MainCtrl.$inject = ['figureService', 'boardService', 'userService'];
	
	function MainCtrl(figureService, boardService, userService) {
		var vm = this;

		vm.board = new boardService.constructor (8, 8, userService.player1, userService.player2)

		console.log('userService', userService);
		console.log('boardService', boardService);
	}
})();

