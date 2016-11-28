(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('userService', userService);

	userService.$inject = ['figureService'];
		
	function userService(figureService) {
		var service = {
			constructor: Player
			// figuresOrder: 
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
		var figuresExamplesOrder = [
			figures.Bishop,
			figures.Knight,
			figures.Rook,
			figures.Queen
		];

		var isBlack = false;

		function Player (name) {
			var self = this;
			if (isBlack) {
				self.color = 'black';
			} else {
				self.color = 'white';
			}
			self.isBlack = isBlack;
			self.name = name || (self.color + ' player');
			self.figures = [];
			self.deadFigures = [];
			self.figuresExamples = [];

			isBlack = !isBlack;
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

			figuresExamplesOrder.forEach(function(figure) {
				self.figuresExamples.push(new figure(self));
			});

			figuresOrder.forEach(function (Item, i) {
				self.figures.push(new Item (self, {row: rowPieces, col: i + 1}) )
				self.figures.push(new figures.Pawn (self, {row: rowPawn, col: i+1}));
			});

			
			// if (self.color === 'black') {
			// 	// self.figures.push(new figures.Bishop(self, {row: 5, col: 5}));
			// 	self.figures.push(new figures.Knight(self, {row: 6, col: 5}));
			// 	// self.figures.push(new figures.Pawn(self, {row: 4, col: 4}));
			// 	// self.figures.push(new figures.Rook(self, {row: 8, col: 2}));
			// 	// self.figures.push(new figures.Rook(self, {row: 1, col: 2}));
			// 	// self.figures.push(new figures.Rook(self, {row: 1, col: 4}));
				// self.figures.push(new figures.King(self, {row: 8, col: 5}));
			// }
			// if (self.color === 'white') {
			// 	// self.figures.push(new figures.Rook(self, {row: 2, col: 8}));
				// self.figures.push(new figures.King(self, {row: 4, col: 3}));
				// self.figures.push(new figures.Pawn(self, {row: 7, col: 1}));
			// 	// self.figures.push(new figures.Knight(self, {row: 4, col: 5}));
			// 	self.figures.push(new figures.Queen(self, {row: 7, col: 3}));
			// }

			self.king = _.find(self.figures, {name: 'King'});
		};

		Player.prototype.restart = function () {
			var self = this;
			self.figures = [];
			self.figuresExamples = [];
			self.defaultStart();
		}

		Player.prototype.getPiecesValue = function () {
			var self = this;
			var counter = 0;
			self.figures.forEach(function(figure) {
				if (!figure.isDead) {
					counter += figure.value;
				}
			});
			return counter;
		}

		Player.prototype.buryFigure = function (figure) {
			var self = this;
			var index = self.figures.indexOf(figure);
			self.figures.splice(index, 1);
			self.deadFigures.push(figure);
		};

		Player.prototype.addFigure = function (figureExample, cords) {
			var self = this;
			var figure;
			var deadFigure = _.find(self.deadFigures, {name: figureExample.name});

			if (deadFigure) {
				var index = self.deadFigures.indexOf(deadFigure);
				self.deadFigures.splice(index, 1);
				deadFigure.resurect(cords);
				figure = deadFigure;
			} else {
				var Constructor = figureExample.constructor;
					figure = new Constructor(self, cords);
			}

			self.figures.push(figure);
			return figure;
		}


		return service;
	}
})();
