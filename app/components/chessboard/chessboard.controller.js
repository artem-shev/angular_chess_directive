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
		prevCells, startCell, finishCell;

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
				finishCell = cell;
				!finishCell.isSelected ? finishCell.isSelected = true : false;
				selectedCells.dest = {row: cell.row, col: cell.col};
			}

			var validation = vm.board.validateMove(selectedCells);
			
			if (validation) {
				if (prevCells) {
					if (prevCells.start !== startCell && prevCells.start !== finishCell) {
						prevCells.start.isSelected = false;
					}
					if (prevCells.finish !== startCell && prevCells.finish !== finishCell) {
						prevCells.finish.isSelected = false;
					}
				}
				prevCells = {start: startCell, finish: finishCell};
			} else {
				if (!prevCells) {
					delete startCell.isSelected;
					delete finishCell.isSelected;
				}
				if (typeof prevCells === 'object') {
					if (startCell !== prevCells.start && startCell !== prevCells.finish) {
						delete startCell.isSelected;
					}
					if (finishCell !== prevCells.start && finishCell !== prevCells.finish) {
						delete finishCell.isSelected;
					}
				}
			}
			vm.board.makeMove(validation);
			selectedCells = {};
			startCell = undefined;
			finishCell = undefined;
		}
	}
})();
