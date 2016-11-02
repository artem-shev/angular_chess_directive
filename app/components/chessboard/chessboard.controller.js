(function() {
	'use strict';
	angular.module('chessApp')
		.controller('MainCtrl', MainCtrl);

	MainCtrl.$inject = ['figureService', 'boardService', 'userService'];
	
	function MainCtrl(figureService, boardService, userService) {
		var vm = this;

		var player1 = userService.player1;
		var player2 = userService.player2;
		var selectedCells = {}, 
		startCell;

		vm.board = new boardService.constructor (8, 8, player1, player2)
		vm.selectCell = selectCell;

		function selectCell ($event, cell) {
			if (!selectedCells.position) {

				if (!cell.figure) {return;}
			
				startCell = cell;
				startCell.isSelected = true;
				selectedCells.figureId = startCell.figure.id;
				selectedCells.position = {row: cell.row, coll: cell.coll};
				return; 
			} else {
				selectedCells.dest = {row: cell.row, coll: cell.coll};
			}

			var validation = vm.board.validateMove(selectedCells);
			vm.board.makeMove(validation);

			delete startCell.isSelected;
			selectedCells = {};
			startCell = undefined;
		}
	}
})();
