(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('figureService', figureService);

		function figureService() {
			var service = {
				constructors: {
					Pawn: Pawn,
					Bishop: Bishop,
					Knight: Knight,
					Rook: Rook,
					Queen: Queen,
					King: King
				}
			};

			var figuresId = 1;
			//limits to moves 
			var rows = 8; 
			var cols = 8;

			function Figure (userSet, cordinats) {
				var self = this;
				self.isBlack = userSet.isBlack;
				self.cordinats = cordinats;
				self.firstMove = true;
				self.id = figuresId;

				figuresId++;
			}

			Figure.prototype.move = function(position) {
				var self = this;
				self.cordinats = position;
				self.firstMove = false;
			};

			Figure.prototype.death = function() {
				var self = this;
				self.cordinats = undefined;
				self.isDead = true;
			};

			//constructor for major and minor pieces
			function PiecesFigures (userSet, cordinats) {
				var self = this;
				Figure.apply(self, arguments);

				self.moveSettings = {
					movesDescr: [],
					moveLength: 8,
					jump: false
				};
			}

			PiecesFigures.prototype = Object.create(Figure.prototype);
			PiecesFigures.prototype.constructor = PiecesFigures;

			PiecesFigures.prototype.getAvailableMoves = function (cells) {
				var self = this;
				var set = self.moveSettings;
				var availableMoves = [];
				var position = self.cordinats;	
				var i, row, col, move;

				set.movesDescr.forEach(function (dir) {
					for (i = 1; i <= set.moveLength; i++) {
						row = i*dir.row + position.row;
						col = i*dir.col + position.col;

						if (!dir.custom) {
							move = {
								figureId: self.id,
								color: self.color,
								position: position,
								dest: {
									row: row,
									col: col
								},
								kill: true,
								basic: true
							};
						} else {
							move = {
								figureId: self.id,
								color: self.color,
								position: position,
								dest: {
									row: row,
									col: col
								},
								type: dir.custom
							};
						}

						if (row > 0 && row <= rows && col > 0 && col <= cols) {
							availableMoves.push(move);
						}

						if (!set.jump) {
							var cell = _.find(cells, {row: row, col: col}) || {};
							if (cell.figure) {break;}	
						}	
					}
				});

				return availableMoves;
			};

			function Pawn (userSet, cordinats) {
				var self = this;
				Figure.apply(self, arguments);
				self.name = 'pawn';
				self.value = 1;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bP.png';
				} else {
					self.color = 'white'
					self.img = 'img/wP.png'
				}
			}

			Pawn.prototype = Object.create(Figure.prototype);
			Pawn.prototype.constructor = Pawn;

			Pawn.prototype.getAvailableMoves = function() {
				var self = this;
				var availableMoves = []; 
				var moves = [];
				var move; 
				var nRow, nCol;
				var position = self.cordinats;

				switch (self.color) {
					case 'white': 
						nRow = 1;
						break;
					case 'black': 
						nRow = -1;
						break;
				}
				//basic move (+1 row)
				move = {
					figureId: self.id,
					color: self.color,
					position: position,
					dest: {
						row: (1*nRow + position.row),
						col: (0 + position.col)
					},
					kill: false,
					basic: true					
				};

				if (prevalidate(move)) {
					availableMoves.push(move);
				}

				//first move (+2 row)
				if (self.firstMove) {
					move = {
						figureId: self.id,
						color: self.color,
						position: position,
						dest: {
							row: (2*nRow + position.row),
							col: (0 + position.col)
						},
						kill: false,
						basic: true,
						passing: true							
					};
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				} 

				//kill move (+||- 1 col; +1 row)
				for (var i = 1; i <= 2; i++) {
					switch (i) {
						case 1: 
							nCol = 1;
							break;
						case 2: 
							nCol = -1;
							break;
					};
					move = {
						figureId: self.id,
						color: self.color,
						position: position,
						dest: {
							row: (1*nRow + position.row),
							col: (1*nCol + position.col)
						},
						kill: true,
						basic: false							
					};
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				}

				//check if move dont goes out of board
				function prevalidate (move) {
					var validRow = (move.dest.row > 0) && (move.dest.row <= rows);
					var validCol = (move.dest.col > 0) && (move.dest.col <= cols);
					if (validRow && validCol) {return true;}
				}

				return availableMoves;	
			};

			function Bishop (userSet, cordinats) {	
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Bishop';
				self.value = 3;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bB.png';
				} else {
					self.color = 'white'
					self.img = 'img/wB.png'
				}

				self.moveSettings = {
					movesDescr: [
						{row: 1, col: 1},
						{row: 1, col: -1},
						{row: -1, col: 1},
						{row: -1, col: -1}
					],
					moveLength: 8,
					jump: false
				};
			}

			Bishop.prototype = Object.create(PiecesFigures.prototype);
			Bishop.prototype.constructor = Bishop;

			function Knight (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments)
				self.name = 'Knight';
				self.value = 3;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bN.png';
				} else {
					self.color = 'white'
					self.img = 'img/wN.png'
				}

				self.moveSettings = {
					movesDescr: [
						{row: 2, col: 1},
						{row: 2, col: -1},
						{row: -2, col: 1},
						{row: -2, col: -1},
						{row: 1, col: 2},
						{row: -1, col: 2},
						{row: 1, col: -2},
						{row: -1, col: -2}
					],
					moveLength: 1,
					jump: true
				};
			}

			Knight.prototype = Object.create(PiecesFigures.prototype);
			Knight.prototype.constructor = Knight;

			function Rook (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Rook';
				self.value = 5;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bR.png';
				} else {
					self.color = 'white'
					self.img = 'img/wR.png'
				}

				self.moveSettings = {
					movesDescr: [
						{row: 0, col: 1},
						{row: 0, col: -1},
						{row: 1, col: 0},
						{row: -1, col: 0}
					],
					moveLength: 8,
					jump: false
				};
			}

			Rook.prototype = Object.create(PiecesFigures.prototype);
			Rook.prototype.constructor = Rook;

			function Queen (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Queen';
				self.value = 9;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bQ.png';
				} else {
					self.color = 'white'
					self.img = 'img/wQ.png'
				}

				self.moveSettings = {
					movesDescr: [
						{row: 0, col: 1},
						{row: 0, col: -1},
						{row: 1, col: 0},
						{row: -1, col: 0},
						{row: 1, col: 1},
						{row: -1, col: -1},
						{row: -1, col: 1},
						{row: 1, col: -1}
					],
					moveLength: 8,
					jump: false
				};	
			}
			Queen.prototype = Object.create(PiecesFigures.prototype);
			Queen.prototype.constructor = Queen;

			function King (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'King';

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bK.png';
				} else {
					self.color = 'white'
					self.img = 'img/wK.png'
				}	

				self.moveSettings = {
					movesDescr: [
						{row: 1, col: 1},
						{row: 1, col: 0},
						{row: 1, col: -1},
						{row: 0, col: -1},
						{row: -1, col: -1},
						{row: -1, col: 0},
						{row: -1, col: 1},
						{row: 0, col: 1},
					],
					moveLength: 1,
					jump: false
				};
			}

			King.prototype = Object.create(PiecesFigures.prototype);
			King.prototype.constructor = King;

			King.prototype.getAvailableMoves = function(cells) {
				var self = this;

				if (self.firstMove) {
					self.moveSettings.movesDescr.push(
						{row: 0, col: 2, custom: {name: 'castling', long: false}},
						{row: 0, col: -2, custom: {name: 'castling', long: true}}
					);
				}

				return PiecesFigures.prototype.getAvailableMoves.apply(self, arguments);
			};

			return service;
		}
	
})();
