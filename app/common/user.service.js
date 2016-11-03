(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('userService', userService);

	userService.$inject = ['figureService'];
		
	function userService(figureService) {
		var service = {
			constructor: Player
		};
		var figures = figureService.constructors;
		var figuresOrder = [figures.Rook, 
							figures.Knight, 
							figures.Bishop, 
							figures.Queen, 
							figures.King, 
							figures.Bishop, 
							figures.Knight, 
							figures.Rook];

		var isBlack = false;

		function Player (name) {
			var self = this;
			var color;
			if (isBlack) {
				color = 'black';
			} else {
				color = 'white';
			}
			self.isBlack = isBlack;
			self.name = name || (color + ' player');
			self.figures = [];

			isBlack = ! isBlack;
		}

		Player.prototype.defaultStart = function() {
			var self= this;
			var rowPieces, rowPawn;
			if (!self.isBlack) {
				rowPieces = 1;
				rowPawn = 2;
			} else {
				rowPieces = 8;
				rowPawn = 7;
			}

			figuresOrder.forEach(function (Item, i) {
				self.figures.push(new Item (self, {row: rowPieces, coll: i + 1}) )
			});
			for (var i = 1; i <= 8; i++) {
				self.figures.push(new figures.Pawn (self, {row: rowPawn, coll: i}));
			}
		};

		Player.prototype.restart = function () {
			var self = this;
			self.figures = [];
			self.defaultStart();
		}

		return service;
	}
})();
