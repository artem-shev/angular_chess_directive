(function() {
	'use strict';
	angular.module('chessApp')
		.controller('MainCtrl', MainCtrl);

	MainCtrl.$inject = ['figureService', 'boardService', 'userService'];
	
	function MainCtrl(figureService, boardService, userService) {
		var vm = this;

		vm.player1 = new userService.constructor ();
		vm.player2 = new userService.constructor ();

		var selectedCells = {}, 
		startCell;

		vm.board = new boardService.constructor (8, 8, vm.player1, vm.player2);
		vm.selectCell = selectCell;

		function selectCell ($event, cell) {
			if (!selectedCells.position) {

				if (!cell.figure) {return;}
			
				startCell = cell;
				startCell.isSelected = true;
				selectedCells.figureId = startCell.figure.id;
				selectedCells.position = {row: cell.row, col: cell.col};
				return; 
			} else {
				selectedCells.dest = {row: cell.row, col: cell.col};
			}

			var validation = vm.board.validateMove(selectedCells);
			vm.board.makeMove(validation);

			delete startCell.isSelected;
			selectedCells = {};
			startCell = undefined;
		}
	}
})();
